import { GoogleAIFileManager } from '@google/generative-ai/server';
import ora from 'ora';
import chalk from 'chalk';

// Initialize as null - will be set when API key is available
let fileManager = null;

// Function to initialize the file manager with the provided API key
export function initializeFileManager(apiKey) {
  if (!apiKey) {
    throw new Error('API key is required to initialize the file manager');
  }

  fileManager = new GoogleAIFileManager(apiKey);
}

export async function uploadFile(filePath, mimeType = 'text/plain', displayName = 'file.txt') {
  // Check if file manager is initialized
  if (!fileManager) {
    throw new Error('File manager not initialized. Please call initializeFileManager() with your API key first.');
  }

  const spinner = ora('Uploading file...').start();
  
  try {
    const fileRes = await fileManager.uploadFile(filePath, { mimeType, displayName });
    spinner.stop();

    console.log(chalk.magenta('File uploaded successfully.'));
    return fileRes;
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error uploading file:'), error);
    throw error;
  }
}