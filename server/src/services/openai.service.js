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
}

export const openaiService = new OpenAIService();
