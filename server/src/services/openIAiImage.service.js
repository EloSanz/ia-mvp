// src/services/aiImage.service.js
import OpenAI from 'openai';
import { servicesConfig } from '../config/services.config.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


/**
 * Paso 1: Convierte un tema y descripción en palabras clave visuales para la IA de imagen.
 * @param {string} title - Título del deck
 * @param {string} description - Descripción del deck
 * @returns {Promise<string>} Una cadena de palabras clave visuales.
 */
async function _getVisualKeywords(title, description) {
  // Configuración del modelo de texto (más rápido y barato que el de imagen)
  const textModel = servicesConfig.openai.textModel || 'gpt-3.5-turbo';

  const systemPrompt = `You are an expert prompt engineer for a text-to-image AI. Your task is to analyze the following topic for a flashcard deck and distill it into a short list of powerful, visual keywords.

INSTRUCTIONS:
- Read the theme and description.
- Ignore boilerplate text like "This deck is for..." or "You will learn...".
- Extract the core, essential concept.
- Generate 5-7 highly visual, concrete, or symbolic keywords that represent this concept.
- The output MUST be a simple, comma-separated string of keywords.
- DO NOT explain the keywords or use any other format.

EXAMPLE 1:
- Input: title="Legal Aspects of E-commerce", description="This deck covers laws and responsibilities for online merchants."
- Output: "digital gavel, glowing shield, secure padlock on a shopping cart, abstract data streams, minimalist courthouse icon"

EXAMPLE 2:
- Input: title="Quantum Physics", description="This deck will introduce key concepts of quantum mechanics."
- Output: "glowing atom, abstract energy waves, particle trails, cosmic nebula, interconnected web, minimalist style"

EXAMPLE 3:
- Input: title="Conversational English", description="Practice common phrases for everyday conversations."
- Output: "two people talking, speech bubbles (no text), friendly chat, coffee shop background, simple line art"
`;

  try {
    const response = await openai.chat.completions.create({
      model: textModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Title: "${title}"\nDescription: "${description}"` }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const keywords = response.choices[0].message.content.trim();
    console.log(`🎨 Visual keywords generated: "${keywords}"`);
    return keywords;
  } catch (error) {
    console.error('Error generating visual keywords:', error);
    // Fallback: si la generación de keywords falla, usar una versión simple del título.
    return `a symbol representing the concept of "${title}"`;
  }
}


/**
 * Paso 2: Genera una URL de imagen usando las palabras clave visuales.
 * @param {string} title - Título del deck
 * @param {string} description - Descripción del deck
 * @returns {Promise<{url: string|null, error: any|null}>}
 */
export async function generateDeckCoverURL(title, description) {
  console.log("🚀 Titulo de generacion:", title)
  console.log("🚀 Desccripcion de generacion:", description)
  // 1. Obtener palabras clave visuales (Paso 1)
  const visualKeywords = await _getVisualKeywords(title, description);

  // 2. Construir el prompt de imagen final (Paso 2)
  const prompt = `A visually striking, high-quality, text-free illustration for a flashcard deck cover.

**Primary Goal: Absolutely NO text, letters, numbers, or watermarks.** The image must be purely pictorial and symbolic.

**Core Concept:** A clean, modern, digital art illustration representing: "${visualKeywords}"

**Art Style:**
- **Style:** Digital art, cinematic lighting, concept art, high detail.
- **Composition:** Centered, focused, clean composition against a simple background.
- **Color:** Vibrant, harmonious color palette.
- **Mood:** Engaging, educational, modern.
`;

  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'url',
    });
    return { url: response.data[0].url, error: null };
  } catch (error) {
    console.error('Error generating deck cover URL:', error);
    return { url: null, error };
  }
}


/**
 * Paso 2: Genera una imagen en base64 usando las palabras clave visuales.
 * @param {string} title - Título del deck
 * @param {string} description - Descripción del deck
 * @returns {Promise<{ base64: string|null, error: any|null }>}|
 */
export async function generateDeckCoverBase64(title, description) {
  console.log("🚀 Titulo de generacion:", title)
  console.log("🚀 Desccripcion de generacion:", description)
  // 1. Obtener palabras clave visuales (Paso 1)
  const visualKeywords = await _getVisualKeywords(title, description);

  // 2. Construir el prompt de imagen final (Paso 2)
  const prompt = `A visually striking, high-quality, text-free illustration for a flashcard deck cover.

**Primary Goal: Absolutely NO text, letters, numbers, or watermarks.** The image must be purely pictorial and symbolic.

**Core Concept:** A clean, modern, digital art illustration representing: "${visualKeywords}"

**Art Style:**
- **Style:** Digital art, cinematic lighting, concept art, high detail.
- **Composition:** Centered, focused, clean composition against a simple background.
- **Color:** Vibrant, harmonious color palette.
- **Mood:** Engaging, educational, modern.
`;

  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    });

    const base64 = response.data[0].b64_json;
    return { base64, error: null };
  } catch (error) {
    console.error('Error generating deck cover base64:', error);
    return { base64: null, error };
  }
}

