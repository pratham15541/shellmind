import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { handleQuestionLoop } from './handleQuestionLoop.js';
import { handleSession } from './sessionManager.js';

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

// Check or request API key
async function getApiKey() {
  ensureDirectoryExists();

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      if (config.apiKey) {
        return config.apiKey;
      }
    } catch (err) {
      console.error(chalk.red('❌ Error reading chatbot-key.json:'), err);
    }
  }

  const apiKey = await askQuestion(chalk.yellow('🔑 Enter your GEMINI API key (or press Enter to exit): '));
  if (!apiKey) {
    console.log(chalk.red('❌ No API key provided. Exiting...'));
    process.exit(1);
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey }, null, 2));
  console.log(chalk.green('✅ API key saved successfully in jsons/chatbot-key.json!'));
  return apiKey;
}

program
  .version('2.0.7')
  .description('AI Chatbot CLI')
  .option('-f, --file', 'Ask questions from a file')
  .option('-s, --session', 'Start a new session')
  .action(async () => {
    console.log(chalk.greenBright('😊 Welcome to AI Chatbot CLI!'));

    // Ensure API key is available
    const apiKey = await getApiKey();

    // You can now use `apiKey` in your chatbot
    const options = program.opts();
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
