/**
 * Command Parser for Portfolio Terminal
 * Handles tokenization, quote parsing, pipes, and redirects
 */

/**
 * CommandResult class for standardized command output
 */
export class CommandResult {
    constructor(output = '', success = true, exitCode = 0) {
        this.output = output;
        this.success = success;
        this.exitCode = exitCode;
    }

    /**
     * Create a successful command result
     * @param {string} output - Command output
     * @returns {CommandResult}
     */
    static success(output = '') {
        return new CommandResult(output, true, 0);
    }

    /**
     * Create an error command result
     * @param {string} message - Error message
     * @param {number} exitCode - Exit code (default: 1)
     * @returns {CommandResult}
     */
    static error(message, exitCode = 1) {
        return new CommandResult(message, false, exitCode);
    }
}

/**
 * Parse command line into tokens, respecting quoted strings
 * @param {string} line - Command line to parse
 * @returns {string[]} Array of tokens
 */
export function parseCommandLine(line) {
    const tokens = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Handle escape sequences
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        // Handle quotes
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        // Handle spaces (split tokens if not in quotes)
        if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
            if (current.length > 0) {
                tokens.push(current);
                current = '';
            }
            continue;
        }

        // Handle pipe and redirect operators as separate tokens
        if (!inSingleQuote && !inDoubleQuote) {
            if (char === '|') {
                if (current.length > 0) {
                    tokens.push(current);
                    current = '';
                }
                tokens.push('|');
                continue;
            }

            if (char === '>') {
                if (current.length > 0) {
                    tokens.push(current);
                    current = '';
                }
                // Check for >>
                if (i + 1 < line.length && line[i + 1] === '>') {
                    tokens.push('>>');
                    i++;
                } else {
                    tokens.push('>');
                }
                continue;
            }
        }

        // Add character to current token
        current += char;
    }

    // Add final token
    if (current.length > 0) {
        tokens.push(current);
    }

    return tokens;
}

/**
 * Check if line contains an unquoted pipe character
 * @param {string} line - Command line to check
 * @returns {boolean} True if unquoted pipe found
 */
export function containsUnquotedPipe(line) {
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Handle escape sequences
        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        // Track quote state
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        // Check for unquoted pipe
        if (char === '|' && !inSingleQuote && !inDoubleQuote) {
            return true;
        }
    }

    return false;
}

/**
 * Check if line contains an unquoted redirect operator (> or >>)
 * @param {string} line - Command line to check
 * @returns {boolean} True if unquoted redirect found
 */
export function containsUnquotedRedirect(line) {
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Handle escape sequences
        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        // Track quote state
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }

        // Check for unquoted redirect
        if (char === '>' && !inSingleQuote && !inDoubleQuote) {
            return true;
        }
    }

    return false;
}

/**
 * Split command line by unquoted pipe characters
 * @param {string} line - Command line to split
 * @returns {string[]} Array of command strings
 */
export function splitByPipe(line) {
    const commands = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Handle escape sequences
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === '\\') {
            current += char;
            escaped = true;
            continue;
        }

        // Track quote state
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            current += char;
            continue;
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            current += char;
            continue;
        }

        // Split on unquoted pipe
        if (char === '|' && !inSingleQuote && !inDoubleQuote) {
            commands.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    // Add final command
    if (current.length > 0) {
        commands.push(current.trim());
    }

    return commands;
}

/**
 * Parse redirect from command line
 * @param {string} line - Command line with redirect
 * @returns {{command: string, file: string, append: boolean}|null} Parsed redirect or null
 */
export function parseRedirect(line) {
    const tokens = parseCommandLine(line);

    // Find redirect operator
    let redirectIndex = -1;
    let append = false;

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '>>' || tokens[i] === '>') {
            redirectIndex = i;
            append = tokens[i] === '>>';
            break;
        }
    }

    if (redirectIndex === -1) {
        return null;
    }

    // Extract command (everything before redirect)
    const commandTokens = tokens.slice(0, redirectIndex);
    if (commandTokens.length === 0) {
        return null;
    }

    // Extract target file (everything after redirect)
    const fileTokens = tokens.slice(redirectIndex + 1);
    if (fileTokens.length === 0) {
        return null;
    }

    // Reconstruct command and file
    const command = commandTokens.join(' ');
    const file = fileTokens.join(' '); // Handle multiple tokens after redirect

    return {
        command: command.trim(),
        file: file.trim(),
        append
    };
}
