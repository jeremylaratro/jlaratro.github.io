/**
 * Terminal UI Component
 * Integrates the terminal into the homepage with full keyboard navigation,
 * command history, and styled output rendering.
 */

import { CommandExecutor } from './executor.js';

export class Terminal {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Terminal container "${containerSelector}" not found`);
    }

    this.executor = new CommandExecutor();
    this.historyIndex = -1;
    this.currentInput = '';
    this.init();
  }

  /**
   * Initialize the terminal
   */
  init() {
    this.createTerminalHTML();
    this.setupElements();
    this.setupEventListeners();
    this.focus();
    this.displayWelcome();
  }

  /**
   * Generate terminal HTML structure
   */
  createTerminalHTML() {
    this.container.innerHTML = `
      <div class="terminal-output" id="terminal-output"></div>
      <div class="terminal-input-line">
        <span class="terminal-prompt">guest@portfolio:~$</span>
        <input type="text" class="terminal-input" id="terminal-input"
               autocomplete="off" spellcheck="false" autofocus>
      </div>
    `;
  }

  /**
   * Cache DOM element references
   */
  setupElements() {
    this.outputContainer = this.container.querySelector('#terminal-output');
    this.inputElement = this.container.querySelector('#terminal-input');
    this.promptElement = this.container.querySelector('.terminal-prompt');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Click anywhere on terminal to focus input
    this.container.addEventListener('click', (e) => {
      if (e.target !== this.inputElement) {
        this.focus();
      }
    });

    // Handle keyboard input
    this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Prevent default paste behavior but allow paste
    this.inputElement.addEventListener('paste', (e) => {
      // Allow default paste behavior
    });
  }

  /**
   * Handle keyboard events
   */
  handleKeyDown(event) {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        const input = this.inputElement.value.trim();
        if (input) {
          this.executeCommand(input);
        } else {
          this.addOutput('', 'prompt', true);
          this.scrollToBottom();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.navigateHistory('up');
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.navigateHistory('down');
        break;

      case 'Tab':
        event.preventDefault();
        // TODO: Implement tab completion
        break;

      case 'c':
        if (event.ctrlKey) {
          event.preventDefault();
          this.inputElement.value = '';
          this.addOutput(this.inputElement.value + '^C', 'prompt', true);
          this.scrollToBottom();
        }
        break;

      case 'l':
        if (event.ctrlKey) {
          event.preventDefault();
          this.outputContainer.innerHTML = '';
          this.scrollToBottom();
        }
        break;
    }
  }

  /**
   * Execute a command
   */
  executeCommand(input) {
    // Display the command with prompt
    this.addOutput(input, 'prompt', true);

    // Execute the command
    const result = this.executor.execute(input);

    // Handle special commands
    if (input.trim() === 'clear' || input.trim() === 'cls') {
      this.outputContainer.innerHTML = '';
    } else if (input.trim() === 'matrix') {
      // Emit custom event for matrix effect
      window.dispatchEvent(new CustomEvent('terminal:matrix'));
      this.addOutput(result.output, result.isError ? 'error' : 'output');
    } else {
      // Display the result
      if (result.output) {
        this.addOutput(result.output, result.isError ? 'error' : 'output');
      }
    }

    // Clear input and reset history
    this.inputElement.value = '';
    this.historyIndex = -1;
    this.currentInput = '';

    // Update prompt with current directory
    this.updatePrompt();

    // Scroll to bottom
    this.scrollToBottom();
  }

  /**
   * Add line(s) to output
   * @param {string} text - The text to add
   * @param {string} type - The output type: 'prompt', 'output', 'error', 'system', 'info'
   * @param {boolean} showPrompt - Whether to show the prompt before the text
   */
  addOutput(text, type = 'output', showPrompt = false) {
    const lines = text.split('\n');

    lines.forEach((line, index) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = `terminal-line ${type}`;

      if (showPrompt && index === 0) {
        const promptSpan = document.createElement('span');
        promptSpan.className = 'terminal-prompt';
        promptSpan.textContent = this.promptElement.textContent + ' ';
        lineDiv.appendChild(promptSpan);
      }

      // Check if line contains HTML (for colored ls output, etc.)
      if (line.includes('<span') || line.includes('</span>')) {
        lineDiv.innerHTML += line;
      } else {
        const textSpan = document.createElement('span');
        textSpan.textContent = line;
        lineDiv.appendChild(textSpan);
      }

      this.outputContainer.appendChild(lineDiv);
    });
  }

  /**
   * Navigate command history
   * @param {string} direction - 'up' or 'down'
   */
  navigateHistory(direction) {
    const history = this.executor.history;

    if (history.length === 0) return;

    // Save current input when starting to navigate
    if (this.historyIndex === -1) {
      this.currentInput = this.inputElement.value;
    }

    if (direction === 'up') {
      // Go backwards in history (older commands)
      if (this.historyIndex < history.length - 1) {
        this.historyIndex++;
        const historyCommand = history[history.length - 1 - this.historyIndex];
        this.inputElement.value = historyCommand;
        // Move cursor to end
        this.inputElement.setSelectionRange(historyCommand.length, historyCommand.length);
      }
    } else if (direction === 'down') {
      // Go forwards in history (newer commands)
      if (this.historyIndex > 0) {
        this.historyIndex--;
        const historyCommand = history[history.length - 1 - this.historyIndex];
        this.inputElement.value = historyCommand;
        // Move cursor to end
        this.inputElement.setSelectionRange(historyCommand.length, historyCommand.length);
      } else if (this.historyIndex === 0) {
        // Return to current input
        this.historyIndex = -1;
        this.inputElement.value = this.currentInput;
        // Move cursor to end
        this.inputElement.setSelectionRange(this.currentInput.length, this.currentInput.length);
      }
    }
  }

  /**
   * Update prompt with current directory
   */
  updatePrompt() {
    const cwd = this.executor.filesystem.getCurrentPath();
    const shortPath = cwd === '/home/guest' ? '~' : cwd;
    this.promptElement.textContent = `guest@portfolio:${shortPath}$`;
  }

  /**
   * Scroll output to bottom
   */
  scrollToBottom() {
    this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
  }

  /**
   * Focus the input element
   */
  focus() {
    this.inputElement.focus();
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    const welcome = `╔══════════════════════════════════════════════════════════╗
║  PORTFOLIO TERMINAL v1.5.0                               ║
║  Type 'help' for available commands                      ║
║  Type 'ls' to explore, 'cat <file>' to read              ║
╚══════════════════════════════════════════════════════════╝`;

    this.addOutput(welcome, 'system');
    this.addOutput('', 'output'); // Empty line for spacing
  }

  /**
   * Clear the terminal output
   */
  clear() {
    this.outputContainer.innerHTML = '';
  }

  /**
   * Get the current working directory
   */
  getCwd() {
    return this.executor.filesystem.getCurrentPath();
  }

  /**
   * Get command history
   */
  getHistory() {
    return this.executor.history;
  }
}

/**
 * Factory function to initialize a terminal
 * @param {string} selector - CSS selector for the terminal container
 * @returns {Terminal} The initialized terminal instance
 */
export function initTerminal(selector) {
  return new Terminal(selector);
}

// Default export
export default Terminal;
