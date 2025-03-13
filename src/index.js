import figlet from 'figlet';
import chalkAnimation from 'chalk-animation';
import { cli } from './cli/cli.js';
import chalk from 'chalk';
import { isFirstRun } from './utils/stateManager.js';

// Function to display an animated banner
const showBanner = async () => {
  const textOptions = { horizontalLayout: 'full' };

  const banners = [
    figlet.textSync('Developed by', textOptions),
    figlet.textSync('Pratham Parikh', textOptions),
    figlet.textSync('AI Chatbot CLI', textOptions),
  ];

  for (const banner of banners) {
    const animation = chalkAnimation.rainbow(banner);
    await new Promise((resolve) => setTimeout(() => {
      animation.stop();
      resolve();
    }, 500));
  }
};

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
  if (error?.name === 'ExitPromptError') {
    console.log(chalk.greenBright('😊 See you later!'));
    process.exit(0); // Exit gracefully
  } else {
    console.error(chalk.red('❌ Uncaught exception:'), error);
    process.exit(1);
  }
});

// Start the CLI
(async () => {
  if (isFirstRun()) await showBanner();
  cli.parse(process.argv); // Parse command-line arguments
})();
