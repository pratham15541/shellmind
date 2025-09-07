import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // still loads .env if present

// Path to chatbot-key.json inside project
const CONFIG_PATH = path.resolve(process.cwd(), 'jsons', 'chatbot-key.json');

function getUserApiKey() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return config.apiKey || null;
    } catch (err) {
      console.error('❌ Error reading chatbot-key.json:', err);
      return null;
    }
  }
  return null;
}

export const env = {
  GEMINI_API_KEY: getUserApiKey() || process.env.GEMINI_API_KEY || null,
};

if (!env.GEMINI_API_KEY) {
  console.error(
    '❌ GEMINI API key is not set. Please set it in ./jsons/chatbot-key.json or as an environment variable GEMINI_API_KEY.'
  );
  process.exit(1);
}
