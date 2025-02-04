import fs from 'fs';
import path from 'path';

// Define paths
const stateDirectory = path.resolve(process.cwd(), 'jsons'); // Ensures absolute path
const stateFilePath = path.join(stateDirectory, 'appstate.json');

// Ensure the state directory exists
const ensureDirectoryExists = () => {
  if (!fs.existsSync(stateDirectory)) {
    try {
      fs.mkdirSync(stateDirectory, { recursive: true });
      console.log('✅ App state directory created successfully.');
    } catch (error) {
      console.error('❌ Error creating app state directory:', error);
    }
  }
};

// Load state from file (returns default state if file is missing or invalid)
const loadState = () => {
  ensureDirectoryExists();
  if (fs.existsSync(stateFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(stateFilePath, 'utf8')) || {};
    } catch (error) {
      console.error('❌ Error reading state file:', error);
      return {};
    }
  }
  return { isFirstRun: true }; // Default state
};

// Save state to file
const saveState = (newState) => {
  ensureDirectoryExists();
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(newState, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error saving state file:', error);
  }
};

// Check if first-time run
const isFirstRun = () => {
  const state = loadState();
  if (state.isFirstRun) {
    state.isFirstRun = false; // Update state
    saveState(state);
    return true;
  }
  return false;
};

export { loadState, saveState, isFirstRun };
