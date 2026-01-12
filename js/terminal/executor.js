/**
 * Command Executor
 * Main execution engine for the terminal that parses and routes commands,
 * handles pipelines and redirects, and manages history and aliases.
 */

import { parseCommandLine, containsUnquotedPipe, containsUnquotedRedirect, splitByPipe, parseRedirect, CommandResult } from './parser.js';
import { VirtualFilesystem } from './filesystem.js';
import * as navigation from './commands/navigation.js';
import * as files from './commands/files.js';
import * as text from './commands/text.js';
import * as encoding from './commands/encoding.js';
import * as utility from './commands/utility.js';
import * as easter from './commands/easter.js';

export class CommandExecutor {
  constructor() {
    this.filesystem = new VirtualFilesystem();
    this.history = [];
    this.maxHistory = 1000;

    // Default aliases
    this.aliases = {
      'll': 'ls -la',
      'la': 'ls -a',
      'l': 'ls -l',
      'cls': 'clear',
      '..': 'cd ..',
      '~': 'cd ~'
    };
  }

  /**
   * Main entry point for command execution
   * @param {string} commandLine - The command line to execute
   * @returns {CommandResult} The result of the command execution
   */
  execute(commandLine) {
    // Trim input
    commandLine = commandLine.trim();

    // Return empty result if blank
    if (!commandLine) {
      return new CommandResult('', true);
    }

    // Add to history
    this.addToHistory(commandLine);

    // Check for aliases and expand
    const firstWord = commandLine.split(/\s+/)[0];
    if (this.aliases[firstWord]) {
      const rest = commandLine.substring(firstWord.length).trim();
      commandLine = rest ? `${this.aliases[firstWord]} ${rest}` : this.aliases[firstWord];
    }

    // Check for pipes
    if (containsUnquotedPipe(commandLine)) {
      return this.executePipeline(commandLine);
    }

    // Check for redirects
    if (containsUnquotedRedirect(commandLine)) {
      return this.executeWithRedirect(commandLine);
    }

    // Parse and execute single command
    const tokens = parseCommandLine(commandLine);
    const command = tokens[0] || '';
    const args = tokens.slice(1);
    return this._executeCommand(command, args, null);
  }

  /**
   * Execute a pipeline of commands
   * @param {string} commandLine - The pipeline command line
   * @returns {CommandResult} The final result
   */
  executePipeline(commandLine) {
    const commands = splitByPipe(commandLine);
    let result = CommandResult.success('');

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i].trim();

      // Check if last command has redirect
      if (i === commands.length - 1 && containsUnquotedRedirect(cmd)) {
        return this.executeWithRedirect(cmd, result.output);
      }

      // Execute with previous output as input
      result = this.executeWithInput(cmd, result.output);

      // If command failed, stop pipeline
      if (!result.success) {
        return result;
      }
    }

    return result;
  }

  /**
   * Execute command with output redirection
   * @param {string} commandLine - The command line with redirect
   * @param {string} pipeInput - Optional piped input
   * @returns {CommandResult} The result
   */
  executeWithRedirect(commandLine, pipeInput = null) {
    const redirect = parseRedirect(commandLine);

    if (!redirect || !redirect.file) {
      return CommandResult.error('Error: Invalid redirect syntax');
    }

    // Execute the command
    const result = this.executeWithInput(redirect.command, pipeInput);

    // Write output to file
    try {
      const currentDir = this.filesystem.pwd();
      const targetPath = this.filesystem.resolvePath(redirect.file, currentDir);

      // Check if file exists for append mode
      const exists = this.filesystem.fileExists(targetPath);

      if (redirect.append) {
        // Append mode
        if (exists) {
          const currentContent = this.filesystem.readFile(targetPath);
          this.filesystem.writeFile(targetPath, currentContent + '\n' + result.output);
        } else {
          this.filesystem.writeFile(targetPath, result.output);
        }
      } else {
        // Overwrite mode
        this.filesystem.writeFile(targetPath, result.output);
      }

      return CommandResult.success('');
    } catch (error) {
      return CommandResult.error(`Error: ${error.message}`);
    }
  }

  /**
   * Execute command with piped input
   * @param {string} commandLine - The command line
   * @param {string} pipeInput - The piped input
   * @returns {CommandResult} The result
   */
  executeWithInput(commandLine, pipeInput) {
    const tokens = parseCommandLine(commandLine);
    const command = tokens[0] || '';
    const args = tokens.slice(1);
    return this._executeCommand(command, args, pipeInput);
  }

  /**
   * Route command to appropriate handler
   * @param {string} command - The command name
   * @param {Array<string>} args - The command arguments
   * @param {string} pipeInput - Optional piped input
   * @returns {CommandResult} The result
   * @private
   */
  _executeCommand(command, args, pipeInput) {
    if (!command) {
      return CommandResult.success('');
    }

    // Command routing map
    const commands = {
      // Navigation
      'pwd': () => navigation.pwd(this.filesystem),
      'cd': () => navigation.cd(args, this.filesystem),
      'ls': () => navigation.ls(args, this.filesystem),

      // Files
      'cat': () => files.cat(args, this.filesystem, pipeInput),
      'head': () => files.head(args, this.filesystem, pipeInput),
      'tail': () => files.tail(args, this.filesystem, pipeInput),
      'less': () => files.less(args, this.filesystem),
      'file': () => files.file(args, this.filesystem),
      'stat': () => files.stat(args, this.filesystem),

      // Text processing
      'grep': () => text.grep(args, this.filesystem, pipeInput),
      'wc': () => text.wc(args, this.filesystem, pipeInput),
      'sort': () => text.sort(args, this.filesystem, pipeInput),
      'uniq': () => text.uniq(args, this.filesystem, pipeInput),
      'cut': () => text.cut(args, this.filesystem, pipeInput),
      'tr': () => text.tr(args, pipeInput),

      // Encoding
      'base64': () => encoding.base64(args, this.filesystem, pipeInput),
      'xxd': () => encoding.xxd(args, this.filesystem, pipeInput),
      'strings': () => encoding.strings(args, this.filesystem, pipeInput),
      'md5sum': () => encoding.md5sum(args, this.filesystem, pipeInput),
      'sha256sum': () => encoding.sha256sum(args, this.filesystem, pipeInput),
      'rot13': () => encoding.rot13(args, pipeInput),
      'rev': () => encoding.rev(args, this.filesystem, pipeInput),

      // Utility
      'echo': () => utility.echo(args),
      'clear': () => utility.clear(),
      'help': () => utility.help(args),
      'man': () => utility.man(args),
      'history': () => utility.history(args, this),
      'whoami': () => utility.whoami(),
      'date': () => utility.date(),
      'uname': () => utility.uname(args),
      'alias': () => utility.alias(args, this),
      'type': () => utility.type(args, this),

      // Easter eggs
      'sudo': () => easter.sudo(args),
      'rm': () => easter.rm(args, this.filesystem),
      'cowsay': () => easter.cowsay(args),
      'matrix': () => easter.matrix(),
      'hack': () => easter.hack(args),
      'neofetch': () => easter.neofetch(),
      'sl': () => easter.sl(),
      'fortune': () => easter.fortune(),
      'exit': () => easter.exit(),
    };

    // Execute command if it exists
    if (commands[command]) {
      try {
        return commands[command]();
      } catch (error) {
        return CommandResult.error(`Error executing ${command}: ${error.message}`);
      }
    }

    // Command not found
    return CommandResult.error(`Command not found: ${command}. Type 'help' for available commands.`);
  }

  /**
   * Add command to history
   * @param {string} command - The command to add
   */
  addToHistory(command) {
    // Don't add empty commands or duplicate consecutive commands
    if (!command.trim() || (this.history.length > 0 && this.history[this.history.length - 1] === command)) {
      return;
    }

    this.history.push(command);

    // Enforce max history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Set a command alias
   * @param {string} name - The alias name
   * @param {string} command - The command to alias
   */
  setAlias(name, command) {
    this.aliases[name] = command;
  }

  /**
   * Get all aliases
   * @returns {Object} The aliases map
   */
  getAliases() {
    return { ...this.aliases };
  }

  /**
   * Get command history
   * @returns {Array<string>} The history array
   */
  getHistory() {
    return [...this.history];
  }
}

// Default export
export default CommandExecutor;
