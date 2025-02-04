import { GoogleAIFileManager } from '@google/generative-ai/server';
import ora from 'ora';
import { env } from '../configs/env.js';
import chalk from 'chalk';

const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY);

export async function uploadFile(filePath, mimeType = 'text/plain', displayName = 'file.txt') {
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
