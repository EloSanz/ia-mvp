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

  /**
   * Genera flashcards desde un documento estructurado
   * @param {Object} documentData - Datos del documento parseado
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Array>} Array de flashcards generadas
   */
  async generateFlashcardsFromDocument(documentData, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const { text, structure, chunks } = documentData;
    const { flashcardCount = 15, difficulty = 'intermediate' } = options;

    // Si el documento es corto (un solo chunk), procesarlo completo
    if (chunks.length === 1) {
      return this.generateFlashcards(text, options);
    }

    // Si se detectaron secciones con títulos, generar por secciones temáticas
    if (structure.sections && structure.sections.length > 1) {
      console.log(`📚 Generando flashcards por ${structure.sections.length} secciones temáticas detectadas`);
      return this.generateFlashcardsBySections(structure.sections, flashcardCount, difficulty);
    }

    // Si es largo pero sin secciones claras, procesar por chunks
    console.log(`📄 Generando flashcards por ${chunks.length} chunks de texto`);
    const systemPrompt = `Eres un experto en creación de contenido educativo a partir de documentos.
  
CONTEXTO:
- Estás analizando un documento de ${chunks.length} secciones
- Estructura detectada: ${JSON.stringify(structure)}
- Nivel de dificultad: ${difficulty}

INSTRUCCIONES:
- Identifica los conceptos MÁS importantes de cada sección
- Crea flashcards que cubran el documento completo
- Evita redundancias entre secciones
- Prioriza conceptos clave, definiciones, y relaciones importantes
- Genera aproximadamente ${Math.ceil(flashcardCount / chunks.length)} flashcards por sección
- Usa formato claro: pregunta/concepto en front, respuesta/explicación en back

Devuelve en formato JSON:
{
  "flashcards": [
    {
      "front": "Pregunta o concepto",
      "back": "Respuesta o explicación"
    }
  ]
}`;

    // Procesar cada chunk
    const allFlashcards = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkPrompt = `SECCIÓN ${i + 1} de ${chunks.length}:\n\n${chunks[i]}`;
      
      try {
        const response = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: chunkPrompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        if (result.flashcards && Array.isArray(result.flashcards)) {
          allFlashcards.push(...result.flashcards);
        }
      } catch (error) {
        console.error(`Error parsing chunk ${i + 1}:`, error);
        // Continuar con los demás chunks aunque falle uno
      }
    }

    // Limitar al número solicitado (tomar las primeras)
    return allFlashcards.slice(0, flashcardCount);
  }

  /**
   * Genera flashcards organizadas por secciones temáticas del documento
   * @param {Array} sections - Array de secciones con título y contenido
   * @param {number} flashcardCount - Número total de flashcards a generar
   * @param {string} difficulty - Nivel de dificultad
   * @returns {Promise<Array>} Array de flashcards generadas
   */
  async generateFlashcardsBySections(sections, flashcardCount, difficulty) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    // 🚀 MEJORA: Limitar número de secciones para evitar timeouts y costos excesivos
    const MAX_SECTIONS = 15;
    const sectionsToProcess = sections.slice(0, MAX_SECTIONS);
    
    if (sections.length > MAX_SECTIONS) {
      console.log(`⚠️  Limitando procesamiento a ${MAX_SECTIONS} de ${sections.length} secciones detectadas`);
    }

    const flashcardsPerSection = Math.ceil(flashcardCount / sectionsToProcess.length);
    
    console.log(`📝 Generando ~${flashcardsPerSection} flashcards por cada una de ${sectionsToProcess.length} secciones`);

    // 🚀 MEJORA: Procesar secciones EN PARALELO para velocidad 5-10x más rápida
    const sectionPromises = sectionsToProcess.map(async (section, i) => {
      const sectionText = section.content.join('\n');
      
      // Saltar secciones muy cortas
      if (sectionText.length < 50) {
        console.log(`⏭️  Saltando sección "${section.title}" (muy corta)`);
        return [];
      }

      // 🚀 MEJORA: Limitar contenido de sección muy larga (evita tokens excesivos)
      const MAX_SECTION_LENGTH = 8000; // ~2000 tokens
      const truncatedText = sectionText.length > MAX_SECTION_LENGTH 
        ? sectionText.substring(0, MAX_SECTION_LENGTH) + '...' 
        : sectionText;

      const systemPrompt = `Eres un experto en creación de contenido educativo.

CONTEXTO:
- Estás analizando la sección "${section.title}" de un documento más amplio
- Esta es la sección ${i + 1} de ${sectionsToProcess.length}
- Nivel de dificultad: ${difficulty}

INSTRUCCIONES:
- Identifica los conceptos MÁS importantes de ESTA SECCIÓN ESPECÍFICA
- Genera ${flashcardsPerSection} flashcards de alta calidad
- Enfócate en: definiciones, conceptos clave, relaciones importantes, ejemplos
- Cada flashcard debe ser autocontenida (no asumir conocimiento de otras secciones)
- Usa el contexto del tema "${section.title}" en las flashcards cuando sea útil
- Formato: pregunta/concepto en front, respuesta/explicación detallada en back

Devuelve en formato JSON:
{
  "flashcards": [
    {
      "front": "Pregunta o concepto",
      "back": "Respuesta o explicación"
    }
  ]
}`;

      try {
        const response = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Contenido de la sección:\n\n${truncatedText}` }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        if (result.flashcards && Array.isArray(result.flashcards)) {
          console.log(`✅ Generadas ${result.flashcards.length} flashcards para "${section.title}"`);
          return result.flashcards;
        }
        return [];
      } catch (error) {
        console.error(`❌ Error procesando sección "${section.title}":`, error.message);
        // Retornar array vacío para que Promise.allSettled continúe
        return [];
      }
    });

    // Esperar todas las promesas (incluso si algunas fallan)
    const results = await Promise.allSettled(sectionPromises);
    
    // Recolectar todas las flashcards exitosas
    const allFlashcards = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    console.log(`📦 Total de flashcards generadas: ${allFlashcards.length}`);

    // 🚀 MEJORA: Distribución más inteligente si hay exceso
    if (allFlashcards.length > flashcardCount) {
      console.log(`📊 Distribuyendo de ${allFlashcards.length} a ${flashcardCount} flashcards de forma balanceada`);
      // Tomar proporcionalmente de cada sección en vez de solo las primeras
      const ratio = flashcardCount / allFlashcards.length;
      const selectedFlashcards = [];
      let index = 0;
      
      while (selectedFlashcards.length < flashcardCount && index < allFlashcards.length) {
        selectedFlashcards.push(allFlashcards[index]);
        index = Math.floor(selectedFlashcards.length / ratio);
      }
      
      return selectedFlashcards;
    }

    return allFlashcards;
  }

  /**
   * Genera metadata del deck desde contenido del documento
   * @param {string} documentSummary - Resumen o inicio del documento
   * @param {Object} structure - Estructura del documento (título, secciones)
   * @param {string} filename - Nombre del archivo como fallback
   * @returns {Promise<Object>} Metadata del deck (name, description)
   */
  async generateDeckMetadataFromDocument(documentSummary, structure = {}, filename = '') {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    // Usar título extraído del documento si existe
    if (structure.title && structure.title.length > 5) {
      console.log(`📌 Usando título extraído del documento: "${structure.title}"`);
      
      // Generar solo la descripción con IA
      const systemPrompt = `Eres un experto en análisis de contenido educativo.

El título del documento ya está definido: "${structure.title}"

Analiza el contenido y genera SOLO una descripción clara y concisa:

INSTRUCCIONES:
- Escribe una descripción educativa del contenido (2-3 oraciones)
- Identifica el tema principal y subtemas
- Explica qué aprenderá el usuario con este deck
- NO repitas el título en la descripción

Devuelve en formato JSON:
{
  "description": "Descripción detallada del contenido y objetivos de aprendizaje"
}`;

      try {
        const response = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Contenido del documento:\n\n${documentSummary}` }
          ],
          max_tokens: 300,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return {
          name: structure.title,
          description: result.description
        };
      } catch (error) {
        console.error('Error generating description:', error);
        // Fallback: usar título extraído con descripción genérica
        return {
          name: structure.title,
          description: `Contenido de aprendizaje basado en el documento "${structure.title}".`
        };
      }
    }

    // Fallback: usar nombre de archivo limpio si no hay título en el documento
    if (!structure.title && filename) {
      const cleanFilename = filename
        .replace(/\.(pdf|docx?|txt)$/i, '')
        .replace(/[-_]/g, ' ')
        .trim();
      
      if (cleanFilename.length > 5 && cleanFilename.length < 100) {
        console.log(`📌 Usando nombre de archivo como título: "${cleanFilename}"`);
        
        const systemPrompt = `Eres un experto en análisis de contenido educativo.

El título del deck está basado en el nombre del archivo: "${cleanFilename}"

Analiza el contenido y genera SOLO una descripción clara:

INSTRUCCIONES:
- Escribe una descripción educativa del contenido (2-3 oraciones)
- Identifica el tema principal
- Explica qué aprenderá el usuario
- NO repitas el título en la descripción

Devuelve en formato JSON:
{
  "description": "Descripción detallada del contenido"
}`;

        try {
          const response = await this.openai.chat.completions.create({
            model: this.config.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Contenido del documento:\n\n${documentSummary}` }
            ],
            max_tokens: 300,
            temperature: 0.7,
            response_format: { type: 'json_object' }
          });

          const result = JSON.parse(response.choices[0].message.content);
          return {
            name: cleanFilename,
            description: result.description
          };
        } catch (error) {
          console.error('Error generating description:', error);
          return {
            name: cleanFilename,
            description: `Contenido de aprendizaje basado en "${cleanFilename}".`
          };
        }
      }
    }

    // Último fallback: generar ambos con IA
    const systemPrompt = `Eres un experto en análisis de contenido educativo.
  
Analiza el siguiente contenido de documento y genera metadata para un deck de flashcards:

INSTRUCCIONES:
- Crea un título descriptivo y atractivo (máximo 60 caracteres)
- Escribe una descripción clara del contenido (2-3 oraciones)
- Identifica el tema principal
- La descripción debe explicar qué aprenderá el usuario con este deck

Devuelve en formato JSON:
{
  "name": "Título del deck",
  "description": "Descripción detallada del contenido y objetivos de aprendizaje"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Contenido del documento:\n\n${documentSummary}` }
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating deck metadata:', error);
      throw new Error('Failed to generate deck metadata from document');
    }
  }
}

export const openaiService = new OpenAIService();
