import dotenv from 'dotenv';

dotenv.config();

export const servicesConfig = {
  anki: {
    enabled: process.env.ANKI_ENABLED === 'true',
    host: process.env.ANKI_HOST || 'localhost',
    port: process.env.ANKI_PORT || 8765,
    apiKey: process.env.ANKI_API_KEY,
    defaultDeckName: process.env.ANKI_DEFAULT_DECK || 'Default'
  },
  openai: {
    enabled: process.env.OPENAI_ENABLED === 'true',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
  }
};
