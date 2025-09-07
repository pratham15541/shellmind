import { GoogleGenerativeAI } from '@google/generative-ai';
import { Marked } from 'marked';
import cliHtml from 'cli-html';
import ora from 'ora';
import {
  setChatHistoryFilePath,
  loadChatHistory,
  saveChatHistory,
} from '../utils/chatHistory.js';
import { systemInstruction } from '../utils/systemInstruction.js';

const marked = new Marked();

marked.setOptions({
  gfm: true,
  breaks: true,
});

// Initialize these as null - they'll be set when API key is available
let genAI = null;
let model = null;

// Function to initialize the AI model with the provided API key
export function initializeAI(apiKey) {
  if (!apiKey) {
    throw new Error('API key is required to initialize the AI model');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction,
    tools: [
      {
        codeExecution: {},
      },
    ],
  });
}

export async function askQuestion(prompt, fileResponse = '', filePath = null) {
  // Check if AI model is initialized
  if (!model) {
    throw new Error('AI model not initialized. Please call initializeAI() with your API key first.');
  }

  console.log('Asking question:', prompt);

  const spinner = ora('Generating response...').start();
  try {
    // Load the previous chat history
    await setChatHistoryFilePath(filePath);
    const chatHistory = loadChatHistory();

    // Remove timestamps from history
    const filteredHistory = chatHistory.map(({ timestamp, ...rest }) => rest);

    // Create a chat instance with history
    const chat = model.startChat({
      history: filteredHistory,
    });

    let result;
    if (fileResponse !== '') {
      result = await chat.sendMessage([
        prompt,
        {
          fileData: {
            fileUri: fileResponse.file.uri,
            mimeType: fileResponse.file.mimeType,
          },
        },
      ]);
    } else {
      result = await chat.sendMessage(prompt);
    }
    spinner.stop();

    const htmlRes = marked.parse(result.response.text());
    console.log(cliHtml(htmlRes));

    // Append user prompt and model response to history
    const timestamp = new Date().toISOString();
    chatHistory.push({ role: 'user', parts: [{ text: prompt }], timestamp });
    chatHistory.push({ role: 'model', parts: [{ text: result.response.text() }], timestamp });

    // Save updated chat history
    saveChatHistory(chatHistory);
  } catch (error) {
    spinner.stop();
    console.error('Error while generating content:', error);
    throw error; // Re-throw so calling code can handle it
  }
}