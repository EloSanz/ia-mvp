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
  async generateFlashcards(text, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI service is not configured');
    }

    const systemPrompt = `You are a helpful AI that creates high-quality flashcards for studying.
    Generate concise and clear flashcards from the provided text.
    Each flashcard should have a front (question/concept) and back (answer/explanation).
    Focus on key concepts and important details.
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
