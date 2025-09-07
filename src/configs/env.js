import fs from 'fs';
import os from 'os';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // still loads .env if present

const CONFIG_PATH = path.join(os.homedir(), '.chatbot-cli.json');

function getUserApiKey() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return config.apiKey || null;
    } catch {
      return null;
    }
  }
  return null;
}

export const env = {
  GEMINI_API_KEY: getUserApiKey() || process.env.GEMINI_API_KEY || null,
};
if (!env.GEMINI_API_KEY) {
  console.error('❌ GEMINI API key is not set. Please set it in ~/.chatbot-cli.json or as an environment variable GEMINI_API_KEY.');
  process.exit(1);
}