/**
 * Utility Commands for Portfolio Terminal
 * Includes: echo, clear, help, man, history, whoami, date, uname, alias, type
 */

import { CommandResult } from '../parser.js';

// ============================================================================
// Command Metadata - Used by help and man
// ============================================================================

const COMMAND_CATEGORIES = {
    navigation: {
        title: 'NAVIGATION',
        commands: ['pwd', 'cd', 'ls', 'tree']
    },
    files: {
        title: 'FILES',
        commands: ['cat', 'head', 'tail', 'touch', 'mkdir', 'rm', 'cp', 'mv', 'find', 'file']
    },
    text: {
        title: 'TEXT PROCESSING',
        commands: ['grep', 'wc', 'sort', 'uniq', 'cut', 'tr', 'sed']
    },
    encoding: {
        title: 'ENCODING',
        commands: ['base64', 'base32', 'hex', 'rot13', 'md5', 'sha256']
    },
    utility: {
        title: 'UTILITY',
        commands: ['echo', 'clear', 'help', 'man', 'history', 'whoami', 'date', 'uname', 'alias', 'type']
    }
};

const COMMAND_DESCRIPTIONS = {
    // Navigation
    'pwd': 'Print working directory',
    'cd': 'Change directory',
    'ls': 'List directory contents',
    'tree': 'Display directory tree',

    // Files
    'cat': 'Display file contents',
    'head': 'Display first lines of file',
    'tail': 'Display last lines of file',
    'touch': 'Create empty file',
    'mkdir': 'Create directory',
    'rm': 'Remove files/directories',
    'cp': 'Copy files/directories',
    'mv': 'Move/rename files',
    'find': 'Search for files',
    'file': 'Determine file type',

    // Text Processing
    'grep': 'Search text patterns',
    'wc': 'Count lines/words/characters',
    'sort': 'Sort lines',
    'uniq': 'Filter duplicate lines',
    'cut': 'Extract columns from lines',
    'tr': 'Translate characters',
    'sed': 'Stream editor',

    // Encoding
    'base64': 'Base64 encode/decode',
    'base32': 'Base32 encode/decode',
    'hex': 'Hexadecimal encode/decode',
    'rot13': 'ROT13 cipher',
    'md5': 'Calculate MD5 hash',
    'sha256': 'Calculate SHA256 hash',

    // Utility
    'echo': 'Print text to output',
    'clear': 'Clear terminal screen',
    'help': 'Show available commands',
    'man': 'Display manual pages',
    'history': 'Show command history',
    'whoami': 'Print current user',
    'date': 'Display current date/time',
    'uname': 'Print system information',
    'alias': 'Manage command aliases',
    'type': 'Show command type'
};

const MANUAL_PAGES = {
    echo: {
        name: 'echo',
        synopsis: 'echo [-n] [-e] [STRING...]',
        description: 'Display a line of text to the terminal output.',
        options: [
            '-n    Do not output trailing newline',
            '-e    Enable interpretation of backslash escapes'
        ],
        escapes: [
            '\\n    newline',
            '\\t    horizontal tab',
            '\\\\    backslash'
        ],
        examples: [
            'echo "Hello World"',
            'echo -n "No newline"',
            'echo -e "Line 1\\nLine 2"',
            'echo "Current path: $PWD"'
        ]
    },

    clear: {
        name: 'clear',
        synopsis: 'clear',
        description: 'Clear the terminal screen and scroll history.',
        options: [],
        examples: ['clear']
    },

    help: {
        name: 'help',
        synopsis: 'help [COMMAND]',
        description: 'Display information about available commands. Without arguments, lists all commands by category. With a command name, shows detailed help for that specific command.',
        options: [],
        examples: [
            'help',
            'help ls',
            'help grep'
        ]
    },

    man: {
        name: 'man',
        synopsis: 'man COMMAND',
        description: 'Display the manual page for a command, including detailed usage, options, and examples.',
        options: [],
        examples: [
            'man echo',
            'man grep',
            'man base64'
        ]
    },

    history: {
        name: 'history',
        synopsis: 'history [-c]',
        description: 'Display the command history list with line numbers. Each command is numbered for easy reference.',
        options: [
            '-c    Clear command history'
        ],
        examples: [
            'history',
            'history -c'
        ]
    },

    whoami: {
        name: 'whoami',
        synopsis: 'whoami',
        description: 'Print the current user name.',
        options: [],
        examples: ['whoami']
    },

    date: {
        name: 'date',
        synopsis: 'date',
        description: 'Display the current date and time in the system timezone.',
        options: [],
        examples: ['date']
    },

    uname: {
        name: 'uname',
        synopsis: 'uname [-a]',
        description: 'Print system information.',
        options: [
            '-a    Print all information'
        ],
        examples: [
            'uname',
            'uname -a'
        ]
    },

    alias: {
        name: 'alias',
        synopsis: 'alias [NAME[=VALUE]...]',
        description: 'Define or display command aliases. Without arguments, displays all current aliases. With arguments, creates new aliases.',
        options: [],
        examples: [
            'alias',
            'alias ll="ls -la"',
            'alias cls="clear"'
        ]
    },

    type: {
        name: 'type',
        synopsis: 'type COMMAND...',
        description: 'Display information about command type, indicating whether it is a builtin command, alias, or external command.',
        options: [],
        examples: [
            'type ls',
            'type echo',
            'type ll'
        ]
    }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Process escape sequences in a string
 * @param {string} str - Input string
 * @returns {string} String with escapes processed
 */
function processEscapes(str) {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\');
}

/**
 * Format manual page for display
 * @param {Object} manPage - Manual page object
 * @returns {string} Formatted manual page
 */
function formatManPage(manPage) {
    let output = [];

    output.push(`NAME`);
    output.push(`    ${manPage.name} - ${COMMAND_DESCRIPTIONS[manPage.name] || 'command'}`);
    output.push('');

    output.push(`SYNOPSIS`);
    output.push(`    ${manPage.synopsis}`);
    output.push('');

    output.push(`DESCRIPTION`);
    output.push(`    ${manPage.description}`);
    output.push('');

    if (manPage.options && manPage.options.length > 0) {
        output.push(`OPTIONS`);
        manPage.options.forEach(opt => {
            output.push(`    ${opt}`);
        });
        output.push('');
    }

    if (manPage.escapes && manPage.escapes.length > 0) {
        output.push(`ESCAPE SEQUENCES`);
        manPage.escapes.forEach(esc => {
            output.push(`    ${esc}`);
        });
        output.push('');
    }

    if (manPage.examples && manPage.examples.length > 0) {
        output.push(`EXAMPLES`);
        manPage.examples.forEach(ex => {
            output.push(`    ${ex}`);
        });
        output.push('');
    }

    return output.join('\n');
}

// ============================================================================
// Command Implementations
// ============================================================================

/**
 * echo - Print text to output
 * @param {string[]} args - Command arguments
 * @returns {CommandResult}
 */
export function echo(args) {
    if (!args || args.length === 0) {
        return CommandResult.success('');
    }

    let noNewline = false;
    let interpretEscapes = false;
    let textArgs = [];

    // Parse flags
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-n') {
            noNewline = true;
        } else if (arg === '-e') {
            interpretEscapes = true;
        } else if (arg.startsWith('-') && arg.length > 1) {
            // Combined flags like -ne
            if (arg.includes('n')) noNewline = true;
            if (arg.includes('e')) interpretEscapes = true;
        } else {
            textArgs.push(arg);
        }
    }

    // Join text arguments
    let output = textArgs.join(' ');

    // Process escape sequences if -e flag is set
    if (interpretEscapes) {
        output = processEscapes(output);
    }

    // Add newline unless -n flag is set
    if (!noNewline && !output.endsWith('\n')) {
        output += '\n';
    }

    return CommandResult.success(output);
}

/**
 * clear - Clear terminal screen
 * @returns {CommandResult} Special result with clear marker
 */
export function clear() {
    // Return special marker that UI will interpret as clear signal
    const result = CommandResult.success('');
    result.clearScreen = true;
    return result;
}

/**
 * help - Show available commands
 * @param {string[]} args - Command arguments
 * @param {Object} executor - Command executor (for accessing all commands)
 * @returns {CommandResult}
 */
export function help(args, executor) {
    // If specific command requested, show detailed help
    if (args && args.length > 0) {
        const command = args[0];

        if (MANUAL_PAGES[command]) {
            const manPage = MANUAL_PAGES[command];
            let output = [];
            output.push(`${manPage.name} - ${COMMAND_DESCRIPTIONS[command]}`);
            output.push('');
            output.push(`Usage: ${manPage.synopsis}`);
            output.push('');
            output.push(manPage.description);

            if (manPage.options && manPage.options.length > 0) {
                output.push('');
                output.push('Options:');
                manPage.options.forEach(opt => {
                    output.push(`  ${opt}`);
                });
            }

            return CommandResult.success(output.join('\n'));
        } else {
            return CommandResult.error(`help: no help topics match '${command}'`);
        }
    }

    // Show all commands by category
    let output = [];
    output.push('Available commands:');
    output.push('');

    Object.values(COMMAND_CATEGORIES).forEach(category => {
        output.push(category.title);
        category.commands.forEach(cmd => {
            const desc = COMMAND_DESCRIPTIONS[cmd] || '';
            const padding = ' '.repeat(12 - cmd.length);
            output.push(`  ${cmd}${padding}${desc}`);
        });
        output.push('');
    });

    output.push("Type 'help <command>' for detailed information about a specific command.");
    output.push("Type 'man <command>' for full manual pages.");

    return CommandResult.success(output.join('\n'));
}

/**
 * man - Display manual pages
 * @param {string[]} args - Command arguments
 * @returns {CommandResult}
 */
export function man(args) {
    if (!args || args.length === 0) {
        return CommandResult.error('What manual page do you want?\nFor example, try "man echo"');
    }

    const command = args[0];

    if (!MANUAL_PAGES[command]) {
        return CommandResult.error(`No manual entry for ${command}`);
    }

    return CommandResult.success(formatManPage(MANUAL_PAGES[command]));
}

/**
 * history - Show command history
 * @param {string[]} args - Command arguments
 * @param {Object} executor - Command executor with history access
 * @returns {CommandResult}
 */
export function history(args, executor) {
    // Check for -c flag to clear history
    if (args && args.length > 0 && args[0] === '-c') {
        if (executor && executor.clearHistory) {
            executor.clearHistory();
            return CommandResult.success('');
        }
        return CommandResult.error('history: cannot clear history');
    }

    // Get history from executor
    if (!executor || !executor.getHistory) {
        return CommandResult.error('history: not available');
    }

    const historyList = executor.getHistory();

    if (historyList.length === 0) {
        return CommandResult.success('');
    }

    // Format history with line numbers
    const output = historyList.map((cmd, index) => {
        const lineNum = (index + 1).toString().padStart(5);
        return `${lineNum}  ${cmd}`;
    }).join('\n');

    return CommandResult.success(output);
}

/**
 * whoami - Print current user
 * @returns {CommandResult}
 */
export function whoami() {
    return CommandResult.success('guest');
}

/**
 * date - Display current date and time
 * @returns {CommandResult}
 */
export function date() {
    const now = new Date();

    // Format: Mon Jan 11 12:00:00 UTC 2026
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const formatted = `${dayName} ${monthName} ${day} ${hours}:${minutes}:${seconds} UTC ${year}`;

    return CommandResult.success(formatted);
}

/**
 * uname - Print system information
 * @param {string[]} args - Command arguments
 * @returns {CommandResult}
 */
export function uname(args) {
    const hasFlag = args && args.length > 0 && args[0] === '-a';

    if (hasFlag) {
        // Full system info
        const output = 'PortfolioOS 1.5.0 portfolio-terminal x86_64 GNU/Linux';
        return CommandResult.success(output);
    }

    // Just OS name
    return CommandResult.success('PortfolioOS');
}

/**
 * alias - Manage command aliases
 * @param {string[]} args - Command arguments
 * @param {Object} executor - Command executor with alias management
 * @returns {CommandResult}
 */
export function alias(args, executor) {
    // If no args, list all aliases
    if (!args || args.length === 0) {
        if (!executor || !executor.getAliases) {
            return CommandResult.success('');
        }

        const aliases = executor.getAliases();
        if (Object.keys(aliases).length === 0) {
            return CommandResult.success('');
        }

        const output = Object.entries(aliases)
            .map(([name, value]) => `alias ${name}='${value}'`)
            .join('\n');

        return CommandResult.success(output);
    }

    // Parse alias definition (e.g., "ll=ls -la" or "ll='ls -la'")
    const fullArg = args.join(' ');
    const match = fullArg.match(/^(\w+)=(.+)$/);

    if (!match) {
        return CommandResult.error('alias: invalid syntax\nUsage: alias name=\'command\'');
    }

    const [, name, value] = match;
    // Remove surrounding quotes if present
    const cleanValue = value.replace(/^['"]|['"]$/g, '');

    if (!executor || !executor.setAlias) {
        return CommandResult.error('alias: not available');
    }

    executor.setAlias(name, cleanValue);
    return CommandResult.success('');
}

/**
 * type - Show command type
 * @param {string[]} args - Command arguments
 * @param {Object} executor - Command executor with command registry
 * @returns {CommandResult}
 */
export function type(args, executor) {
    if (!args || args.length === 0) {
        return CommandResult.error('type: missing operand\nUsage: type COMMAND');
    }

    const output = [];

    for (const cmdName of args) {
        // Check if it's an alias
        if (executor && executor.getAliases) {
            const aliases = executor.getAliases();
            if (aliases[cmdName]) {
                output.push(`${cmdName} is aliased to \`${aliases[cmdName]}\``);
                continue;
            }
        }

        // Check if it's a builtin command
        if (COMMAND_DESCRIPTIONS[cmdName]) {
            output.push(`${cmdName} is a shell builtin`);
        } else {
            output.push(`${cmdName}: not found`);
        }
    }

    return CommandResult.success(output.join('\n'));
}

// ============================================================================
// Exports
// ============================================================================

export default {
    echo,
    clear,
    help,
    man,
    history,
    whoami,
    date,
    uname,
    alias,
    type
};
