import { editor, confirm } from '@inquirer/prompts';
import { askQuestion } from '../api/api.js';
import { selectFile } from './selectFile.js';
import chalk from 'chalk';

export async function handleQuestionLoop(filePath = null, enableFileSelection = false) {
  let continueAsking = true;

  while (continueAsking) {
    let fileReference = '';

    // File Selection Logic
    if (enableFileSelection) {
      const useFile = await confirm({
        message: 'Do you want to attach a file for this question?',
        default: true,
      });

      if (useFile) {
        fileReference = await selectFile();
        if (!fileReference) {
          // Retry file selection if it fails
          continueAsking = await confirm({
            message: 'Do you want to try again?',
            default: true,
          });
          if (!continueAsking) break;
          continue;
        }
      }
    }

    // Get User Question
    const question = await editor({
      message: 'Ask your question: (Save and close editor to submit)',
    });

    if (!question) {
      console.log(chalk.red('No question provided. Exiting...'));
      break;
    }

    // Process the Question
    try {
      await askQuestion(question, fileReference, filePath);
    } catch (error) {
      console.error(chalk.red('Error processing question:'), error);
    }

    // Ask if User Wants to Continue
    continueAsking = await confirm({
      message: 'Do you want to ask another question?',
      default: true,
    });
  }

  console.log(chalk.green('Goodbye!'));
}
