import { editor, confirm } from '@inquirer/prompts';
import { askQuestion } from '../api/api.js';
import { selectFile } from './selectFile.js';
import chalk from 'chalk';

export async function handleQuestionLoop(filePath = null, enableFileSelection = false, apiKey = null) {
  let continueAsking = true;

  // Verify API key is provided
  if (!apiKey) {
    console.error(chalk.red('❌ No API key provided to handleQuestionLoop. Please restart the application.'));
    return;
  }

  while (continueAsking) {
    let fileReference = '';

    // File Selection Logic
    if (enableFileSelection) {
      const useFile = await confirm({
        message: 'Do you want to attach a file for this question?',
        default: true,
      });

      if (useFile) {
        try {
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
        } catch (error) {
          if (error.message && error.message.includes('not initialized')) {
            console.error(chalk.red('❌ Services are not properly initialized. Please restart the application.'));
            break;
          }
          console.error(chalk.red('Error during file selection:'), error);
          
          // Ask if user wants to continue without file
          const continueWithoutFile = await confirm({
            message: 'File selection failed. Do you want to continue without a file?',
            default: true,
          });
          
          if (!continueWithoutFile) {
            continueAsking = await confirm({
              message: 'Do you want to try again?',
              default: true,
            });
            if (!continueAsking) break;
            continue;
          }
        }
      }
    }

    // Get User Question
    const question = await editor({
      message: 'Ask your question: (Save and close editor to submit)',
    });

    if (!question || question.trim() === '') {
      console.log(chalk.yellow('⚠️ No question provided.'));
      
      // Ask if user wants to try again
      continueAsking = await confirm({
        message: 'Do you want to try asking another question?',
        default: true,
      });
      continue;
    }

    // Process the Question
    try {
      await askQuestion(question, fileReference, filePath);
    } catch (error) {
      if (error.message && error.message.includes('not initialized')) {
        console.error(chalk.red('❌ AI services are not properly initialized. Please restart the application.'));
        break;
      }
      
      console.error(chalk.red('Error processing question:'), error.message || error);
      
      // Ask if user wants to try again with the same question
      const retryQuestion = await confirm({
        message: 'There was an error processing your question. Do you want to try again?',
        default: true,
      });
      
      if (retryQuestion) {
        // Retry the same question
        try {
          await askQuestion(question, fileReference, filePath);
        } catch (retryError) {
          console.error(chalk.red('Error on retry:'), retryError.message || retryError);
        }
      }
    }

    // Ask if User Wants to Continue
    continueAsking = await confirm({
      message: 'Do you want to ask another question?',
      default: true,
    });
  }

  console.log(chalk.green('👋 Goodbye!'));
}