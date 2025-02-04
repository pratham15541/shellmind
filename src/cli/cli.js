import { Command } from 'commander';
import chalk from 'chalk';
import { handleQuestionLoop } from './handleQuestionLoop.js';
import { handleSession } from './sessionManager.js';

const program = new Command();

program
  .version('0.0.1')
  .description('AI Chatbot CLI')
  .option('-f, --file', 'Ask questions from a file')
  .option('-s, --session', 'Start a new session')
  .action(async () => {
    console.log(chalk.greenBright('😊 Welcome to AI Chatbot CLI!'));

    const options = program.opts();
    if (options.session && options.file) {
      const filePath = await handleSession(options.session);
      await handleQuestionLoop(filePath, true);
    } else if (options.session) {
      const filePath = await handleSession(options.session);
      await handleQuestionLoop(filePath);
    } else if (options.file) {
      await handleQuestionLoop(null, true);
    }else{
      await handleQuestionLoop();
    }
  });

export const cli = program;
