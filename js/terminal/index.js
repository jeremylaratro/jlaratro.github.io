/**
 * Portfolio Terminal - Main Entry Point
 * Version 1.5.0
 *
 * Interactive terminal emulator for the portfolio website.
 * Provides Unix-like command interface to explore projects and content.
 */

import { Terminal, initTerminal } from './ui.js';
import { CommandExecutor } from './executor.js';
import { VirtualFilesystem } from './filesystem.js';

// Export all public APIs
export { Terminal, initTerminal, CommandExecutor, VirtualFilesystem };

// Auto-initialize if terminal container exists
document.addEventListener('DOMContentLoaded', () => {
  const terminalContainer = document.querySelector('.terminal-body');
  if (terminalContainer) {
    // Add interactive class to signal this is now interactive
    terminalContainer.classList.add('terminal-interactive');

    // Initialize the terminal
    window.portfolioTerminal = initTerminal('.terminal-body');

    console.log('Portfolio Terminal v1.5.0 initialized');
  }
});

// Export for manual initialization
export default Terminal;
