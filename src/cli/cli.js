import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { handleQuestionLoop } from './handleQuestionLoop.js';
import { handleSession } from './sessionManager.js';
import { initializeAI } from '../api/api.js';
import { initializeFileManager } from '../api/fileManager.js';

const program = new Command();

// Paths
const stateDirectory = path.resolve(process.cwd(), 'jsons'); // ./jsons dir in project
const CONFIG_PATH = path.join(stateDirectory, 'chatbot-key.json');

// Ensure jsons dir exists
function ensureDirectoryExists() {
  if (!fs.existsSync(stateDirectory)) {
    fs.mkdirSync(stateDirectory, { recursive: true });
    console.log(chalk.green('✅ jsons directory created.'));
  }
}

// Utility: prompt for input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

// Prompt user for new API key and save
async function promptAndSaveApiKey() {
  const apiKey = await askQuestion(
    chalk.yellow('🔑 Enter your GEMINI API key (or press Enter to exit): ')
  );

  if (!apiKey) {
    console.log(chalk.red('❌ No API key provided. Exiting...'));
    process.exit(1);
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey }, null, 2));
  console.log(chalk.green('✅ API key saved successfully in jsons/chatbot-key.json!'));
  return apiKey;
}

// Check or request API key
async function getApiKey(forceReset = false) {
  ensureDirectoryExists();

  // If forced reset, skip file checking and prompt for new key
  if (forceReset) {
    console.log(chalk.yellow('🔄 Resetting API key...'));
    return await promptAndSaveApiKey();
  }

  // Check if config file exists
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      
      // Check if API key exists and is not empty
      if (config.apiKey && config.apiKey.trim() !== '') {
        return config.apiKey;
      } else {
        // File exists but API key is missing/empty
        console.log(chalk.yellow('⚠️ API key not found in existing config file.'));
        return await promptAndSaveApiKey();
      }
    } catch (err) {
      // File exists but has invalid JSON
      console.error(chalk.red('❌ Invalid JSON in chatbot-key.json. Recreating file...'));
      return await promptAndSaveApiKey();
    }
  } else {
    // File doesn't exist - first time setup
    console.log(chalk.blue('🆕 First time setup detected.'));
    return await promptAndSaveApiKey();
  }
}

// CLI setup
program
  .version('2.0.10')
  .description('AI Chatbot CLI')
  .option('-f, --file', 'Ask questions from a file')
  .option('-s, --session', 'Start a new session')
  .option('--reset-key', 'Reset your saved API key')
  .action(async () => {
    console.log(chalk.greenBright('😊 Welcome to AI Chatbot CLI!'));

    const options = program.opts();

    // Ensure API key is available
    const apiKey = await getApiKey(options.resetKey);

    // Initialize AI with the API key
    try {
      initializeAI(apiKey);
      initializeFileManager(apiKey);
      console.log(chalk.green('✅ AI model and file manager initialized successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize AI services:'), error.message);
      process.exit(1);
    }

    // You can now use `apiKey` in your chatbot
    if (options.session && options.file) {
      const filePath = await handleSession(options.session);
      await handleQuestionLoop(filePath, true, apiKey);
    } else if (options.session) {
      const filePath = await handleSession(options.session);
      await handleQuestionLoop(filePath, false, apiKey);
    } else if (options.file) {
      await handleQuestionLoop(null, true, apiKey);
    } else {
      await handleQuestionLoop(null, false, apiKey);
    }
  });

export const cli = program;