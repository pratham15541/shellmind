import { GoogleGenerativeAI } from '@google/generative-ai';
import { Marked } from 'marked';
import cliHtml from 'cli-html';
import { env } from '../configs/env.js';
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

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction,
  tools: [
    {
      codeExecution: {},
    },
  ],
});

export async function askQuestion(prompt, fileResponse = '', filePath = null) {
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
    console.error('Error while generating content:', error);
  }
}
