// src/services/aiImage.service.js
import OpenAI from 'openai';


/**
 * Genera una imagen de portada minimalista usando OpenAI DALL·E
 * @param {string} title - Título del deck
 * @param {string} description - Descripción del deck
 * @returns {Promise<string>} URL de la imagen generada
 */
export async function generateDeckCoverURL(title, description) {
  // Límite de seguridad: DALL·E 2 tiene un límite de 1000.
  // Dejamos ~300 caracteres para las instrucciones y reservamos ~700 para los inputs.
  const MAX_INPUT_LENGTH = 700;

  // 1. Truncar el Título y la Descripción
  const safeTitle = title.substring(0, MAX_INPUT_LENGTH / 2);
  const safeDescription = description.substring(0, MAX_INPUT_LENGTH / 2);

  // 2. Prompt Optimizado (Mucho más corto, cumple las reglas de estilo)
  const prompt = `
Genera una **ilustración abstracta y conceptual** para una cubierta/tarjeta.
**OBJETIVO CLAVE:** **SIN TEXTO, SIN LETRAS, SIN NÚMEROS, SIN LOGOS, SIN MARCAS DE AGUA.**
**ESTILO:** **Icono minimalista, vectorial, plano (flat design), 2D. Líneas limpias y pocos colores.**
**CONTENIDO:** Un único símbolo o forma abstracta que represente el concepto de:
- **Título:** "${safeTitle}"
- **Descripción:** "${safeDescription}"
**FORMATO:** Composición centrada y simple, fondo liso o suave degradado.
`;
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
  // Límite de seguridad: DALL·E 2 tiene un límite de 1000.
  // Dejamos ~300 caracteres para las instrucciones y reservamos ~700 para los inputs.
  const MAX_INPUT_LENGTH = 700;

  // 1. Truncar el Título y la Descripción
  const safeTitle = title.substring(0, MAX_INPUT_LENGTH / 2);
  const safeDescription = description.substring(0, MAX_INPUT_LENGTH / 2);

  // 2. Prompt Optimizado (Mucho más corto, cumple las reglas de estilo)
  const prompt = `
Genera una **ilustración abstracta y conceptual** para una cubierta/tarjeta.
**OBJETIVO CLAVE:** **SIN TEXTO, SIN LETRAS, SIN NÚMEROS, SIN LOGOS, SIN MARCAS DE AGUA.**
**ESTILO:** **Icono minimalista, vectorial, plano (flat design), 2D. Líneas limpias y pocos colores.**
**CONTENIDO:** Un único símbolo o forma abstracta que represente el concepto de:
- **Título:** "${safeTitle}"
- **Descripción:** "${safeDescription}"
**FORMATO:** Composición centrada y simple, fondo liso o suave degradado.
`;
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
