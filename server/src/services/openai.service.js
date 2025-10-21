import OpenAI from 'openai';
import { servicesConfig } from '../config/services.config.js';

class OpenAIService {
  constructor() {
    const config = servicesConfig.openai;
    if (config.enabled && config.apiKey) {
      this.openai = new OpenAI({
        apiKey: config.apiKey
      });
      this.config = config;
    }
  }

  /**
   * Genera flashcards a partir de un texto
   */
  async generateFlashcards(text, _options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `You are an expert language learning and memorization assistant. Your goal is to create highly effective flashcards optimized for long-term retention.

    ANALYZE the input text and determine the PRIMARY CONTENT TYPE:

    LANGUAGE LEARNING CONTENT (vocabulary, words, phrases):
    - DETECT: Foreign words with translations, vocabulary lists, language learning materials
    - STRATEGY: Use spaced repetition friendly formats. Mix different recall directions.
    - SPECIAL HANDLING FOR CHARACTER-BASED LANGUAGES (Japanese, Chinese, Korean, etc.):
      * Always include romanization (romaji for Japanese, pinyin for Chinese, etc.) in parentheses
      * Example: Front: こんにちは → Back: hola (konnichiwa)
      * Example: Front: 再见 → Back: adiós (zàijiàn)
    - STRUCTURE OPTIONS:
      * Front: Foreign word → Back: Spanish translation + romanization (pronunciation) + example sentence
      * Front: Spanish meaning → Back: Foreign word + pronunciation guide
      * Front: Example sentence with blank → Back: Missing foreign word

    ACRONYMS & TECHNICAL ABBREVIATIONS (requiring memorization):
    - DETECT: Technical terms like PCB, API, CPU, HTTP, etc. in technical/scientific contexts
    - STRATEGY: Focus on recognition and recall of expansions. Include context.
    - STRUCTURE OPTIONS:
      * Front: Acronym → Back: Full expansion + brief explanation + use case
      * Front: "What does ___ stand for?" → Back: Full expansion and meaning
      * Front: Definition → Back: Acronym + context where it's used

    MEMORIZATION-INTENSIVE CONCEPTS (dates, sequences, formulas, classifications):
    - DETECT: Lists, sequences, classifications, dates, formulas, categorizations
    - STRATEGY: Use active recall techniques, reverse questions, context cues
    - STRUCTURE OPTIONS:
      * Front: "What comes after ___?" → Back: Next item + full sequence
      * Front: "What category does ___ belong to?" → Back: Category + other examples
      * Front: Partial sequence → Back: Complete sequence + explanation

    GENERAL CONTENT: For any other content, create standard question-answer flashcards focusing on key concepts.

    GENERATION RULES:
    - Prioritize QUALITY over quantity - fewer excellent flashcards are better than many mediocre ones
    - Use the most effective format for the detected content type
    - Include context clues and mnemonics when helpful
    - For language learning: Mix recall directions (L2→L1 and L1→L2). For character-based languages (Japanese, Chinese, Korean), always include romanization in parentheses.
    - For acronyms: Always explain practical usage
    - For memorization: Use progressive disclosure and spaced repetition principles

    If the provided text is very short (1-2 sentences), generate only 1-2 flashcards. If the text is longer, generate 3-8 flashcards maximum, focusing on the most important concepts.

    Return the flashcards in the following JSON format:
    {
      "flashcards": [
        {
          "front": "question or concept",
          "back": "answer or explanation"
        }
      ]
    }`;

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      return result.flashcards;
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  /**
   * Mejora una flashcard existente
   */
  async improveFlashcard(flashcard) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `You are a helpful AI that improves flashcards for better learning.
    Analyze the provided flashcard and suggest improvements to make it more effective.
    Consider clarity, conciseness, and memorability.
    Keep the same basic concept but make it better for learning.
    Return the improved flashcard in JSON format:
    {
      "front": "improved question or concept",
      "back": "improved answer or explanation"
    }`;

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(flashcard) }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  /**
   * Sugiere temas de decks basados en los decks existentes del usuario
   */
  async suggestDeckTopics(userDecks, count = 3) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `Eres un asistente experto en aprendizaje y memorización. 
    Analiza los decks existentes del usuario y sugiere temas relacionados que podrían interesarle.
    
    INSTRUCCIONES:
    - Basándote en los títulos y descripciones de los decks existentes, identifica patrones de interés
    - Sugiere temas que complementen o expandan sus áreas de estudio actuales
    - Considera diferentes niveles de dificultad y enfoques
    - Cada sugerencia debe ser específica y atractiva
    - Evita repetir temas que ya tiene
    
    Devuelve las sugerencias en formato JSON:
    {
      "topics": [
        {
          "title": "Título del tema sugerido",
          "description": "Descripción breve del tema y por qué es relevante",
          "reasoning": "Por qué este tema se relaciona con sus intereses actuales"
        }
      ]
    }`;

    const userDecksText = userDecks.map(deck => 
      `- "${deck.name}": ${deck.description || 'Sin descripción'}`
    ).join('\n');

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Decks actuales del usuario:\n${userDecksText}\n\nSugiere ${count} temas relacionados.` }
      ],
      max_tokens: this.config.maxTokens,
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });

    try {
      const result = JSON.parse(response.choices[0].message.content);
      return result.topics || [];
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  /**
   * Genera un deck completo desde un tema libre
   */
  async generateCompleteDeck(topic, flashcardCount = 10) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `Eres un experto en creación de contenido educativo. 
    Genera un deck completo de flashcards sobre el tema especificado.
    
    INSTRUCCIONES:
    - Crea un título atractivo y descriptivo para el deck
    - Escribe una descripción clara del contenido y objetivos
    - Genera exactamente ${flashcardCount} flashcards de alta calidad
    - Las flashcards deben cubrir los conceptos más importantes del tema
    - Usa diferentes tipos de preguntas (definiciones, ejemplos, aplicaciones)
    - Asegúrate de que las respuestas sean precisas y educativas
    
    Devuelve todo en formato JSON:
    {
      "deck": {
        "name": "Título del deck",
        "description": "Descripción del deck y sus objetivos"
      },
      "flashcards": [
        {
          "front": "Pregunta o concepto",
          "back": "Respuesta o explicación"
        }
      ]
    }`;

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tema: ${topic}` }
      ],
      max_tokens: this.config.maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }

  /**
   * Genera un deck con configuración específica
   */
  async generateCompleteDeckWithConfig(topic, flashcardCount, difficulty, tags = []) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const difficultyLevels = {
      'beginner': 'principiante',
      'intermediate': 'intermedio', 
      'advanced': 'avanzado'
    };

    const systemPrompt = `Eres un experto en creación de contenido educativo. 
    Genera un deck completo de flashcards sobre el tema especificado con configuración personalizada.
    
    CONFIGURACIÓN:
    - Tema: ${topic}
    - Cantidad de flashcards: ${flashcardCount}
    - Nivel de dificultad: ${difficultyLevels[difficulty] || 'intermedio'}
    - Tags adicionales: ${tags.join(', ') || 'ninguno'}
    
    INSTRUCCIONES:
    - Crea un título atractivo y descriptivo para el deck
    - Escribe una descripción clara del contenido y objetivos
    - Genera exactamente ${flashcardCount} flashcards de alta calidad
    - Adapta la complejidad al nivel ${difficultyLevels[difficulty] || 'intermedio'}
    - Incluye conceptos básicos, intermedios y avanzados según corresponda
    - Las flashcards deben ser progresivas en dificultad
    - Usa diferentes tipos de preguntas (definiciones, ejemplos, aplicaciones, análisis)
    
    Devuelve todo en formato JSON:
    {
      "deck": {
        "name": "Título del deck",
        "description": "Descripción del deck y sus objetivos"
      },
      "flashcards": [
        {
          "front": "Pregunta o concepto",
          "back": "Respuesta o explicación"
        }
      ]
    }`;

    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Genera el deck con la configuración especificada.` }
      ],
      max_tokens: this.config.maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      throw new Error('Failed to parse OpenAI response');
    }
  }
}

export const openaiService = new OpenAIService();
