import { select, input, confirm } from '@inquirer/prompts';
import path from 'path';
import fs from 'fs';

export async function handleSession(enableSession = false) {
  if (!enableSession) return null; // Skip if session handling is disabled

  const sessionDirectory = path.join(process.cwd(), './jsons/sessions');
  if (!fs.existsSync(sessionDirectory)) fs.mkdirSync(sessionDirectory, { recursive: true });

  const sessionFiles = fs.readdirSync(sessionDirectory).filter((file) => file.endsWith('.json'));

  const shouldSelectSession = await confirm({
    message: 'Would you like to select a previous session or create a new one?',
    default: true,
  });

  let sessionFilePath;

  if (shouldSelectSession && sessionFiles.length > 0) {
    const selectedSession = await select({
      message: 'Select a session:',
      choices: sessionFiles.map((file) => ({ name: file, value: file })),
    });
    sessionFilePath = path.join(sessionDirectory, selectedSession);
    console.log(`Selected session: ${selectedSession}`);
  } else {
    const newSessionName = await input({
      message: 'Enter a session name:',
      validate: (input) => {
        const trimmed = input.trim();
        if (!trimmed) return 'Session name cannot be empty.';
        if (fs.existsSync(path.join(sessionDirectory, `${trimmed}.json`))) {
          return 'Session already exists. Please choose a different name.';
        }
        return true;
      },
    });

    sessionFilePath = path.join(sessionDirectory, `${newSessionName}.json`);
    fs.writeFileSync(sessionFilePath, JSON.stringify([], null, 2));
    console.log(`Session created: ${newSessionName}`);
  }

  return sessionFilePath;
}
