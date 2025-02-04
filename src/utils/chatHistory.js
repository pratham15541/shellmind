import fs from 'fs';
import path from 'path';

// Define directory for chat history
const chatHistoryDirectory = path.join(process.cwd(), './jsons');
let chatHistoryFilePath = path.join(chatHistoryDirectory, 'chatHistory.json');

export const setChatHistoryFilePath = (fileName = null) => {
  if (fileName !== null) {
    chatHistoryFilePath = path.resolve(fileName);
  } else {
    // Construct a proper path and normalize it
    fileName = 'chatHistory.json';
    chatHistoryFilePath = path.resolve(chatHistoryDirectory, fileName);
  }
};

// Ensure the directory exists
if (!fs.existsSync(chatHistoryDirectory)) {
  try {
    fs.mkdirSync(chatHistoryDirectory, { recursive: true });
  } catch (err) {
    console.error('Error creating chat history directory:', err);
  }
}

// Ensure the file exists
if (!fs.existsSync(chatHistoryFilePath)) {
  try {
    fs.writeFileSync(chatHistoryFilePath, JSON.stringify([]), 'utf-8');
  } catch (err) {
    console.error('Error creating chat history file:', err);
  }
}

export const loadChatHistory = () => {
  try {
    const data = fs.readFileSync(chatHistoryFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading chat history file:', err);
    return [];
  }
};

export const saveChatHistory = (chatHistory) => {
  try {
    fs.writeFileSync(chatHistoryFilePath, JSON.stringify(chatHistory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving chat history file:', err);
  }
}