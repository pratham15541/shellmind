import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import fileSelector from 'inquirer-file-selector';
import { uploadFile } from '../api/fileManager.js';
import chalk from 'chalk';
import { editor } from '@inquirer/prompts';
import { askQuestion } from '../api/api.js';

export async function selectFile() {
  let filePath;

  // File Selection
  try {
    filePath = await fileSelector({
      message: 'Select a file:',
      allowCancel: true,
    });
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log(chalk.yellow('File selection was canceled.'));
      return null;
    }
    console.error(chalk.red('An error occurred during file selection:'), error);
    return null;
  }

  if (!filePath || filePath === 'canceled') {
    console.log(chalk.yellow('File selection was canceled.'));
    return null;
  }

  // File Metadata Extraction
  const fileDisplayName = path.basename(filePath);
  const fileExtension = path.extname(filePath);
  let mimeType = mime.lookup(fileExtension) || 'application/octet-stream';

  if (fileExtension === '.mp4' && mimeType === 'application/mp4') {
    mimeType = 'video/mp4';
  }

  const allowedMimeTypes = [
    'video/mp4', 'video/mpeg', 'video/mov', 'video/avi',
    'video/x-flv', 'video/mpg', 'video/webm', 'video/wmv',
    'video/3gpp', 'image/png', 'image/jpeg', 'image/webp',
    'image/heic', 'image/heif',
  ];

  // Handle Unsupported File Types
  if (!allowedMimeTypes.includes(mimeType)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const editorResponse = await editor({
        message: 'Ask your question about the file:',
      });
      await askQuestion(`${fileContent}\n${editorResponse}`);
      return null;
    } catch (error) {
      console.error(chalk.red('Failed to read file as text:'), error);
      return null;
    }
  }

  // Upload Allowed File Types
  try {
    return await uploadFile(filePath, mimeType, fileDisplayName);
  } catch (error) {
    console.error(chalk.red('Failed to upload file:'), error);
    return null;
  }
}
