// src/services/aiImage.service.js
import OpenAI from 'openai';


/**
 * Genera una imagen de portada minimalista usando OpenAI DALL·E
 * @param {string} title - Título del deck
 * @param {string} description - Descripción del deck
 * @returns {Promise<string>} URL de la imagen generada
 */
export async function generateDeckCoverURL(title, description) {

  const prompt = `Minimalist flat illustration for a deck titled "${title}". Show a simple icon or symbol related to ${title}, with clean lines and few colors. Concept: ${description}. No text, only visual elements.`;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'url',
    });
    return { url: response.data[0].url, error: null };
  } catch (error) {
    console.error('Error generating deck cover:', error);
    return { url: null, error };
  }

}

/**
 * Genera una imagen de portada minimalista usando OpenAI DALL·E
 * @param {string} title - Título del deck
 * @param {string} description - Descripción del deck
 * @returns {Promise<{ base64: string|null, error: any|null }>}
 */
export async function generateDeckCoverBase64(title, description) {
  const prompt = `Minimalist flat illustration for a deck titled "${title}". 
Use only simple geometric shapes or abstract symbols inspired by the theme: ${description}. 
No text, no letters, no words, no emoji. 
Use clean lines, few solid colors, and flat style. 
The design should look like a logo or icon, centered, with no background noise.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json', // 👈 Devuelve la imagen en base64
    });

    const base64 = response.data[0].b64_json;
    return { base64, error: null };
  } catch (error) {
    console.error('Error generating deck cover:', error);
    return { base64: null, error };
  }
}
