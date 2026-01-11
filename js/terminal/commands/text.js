/**
 * Text Processing Commands
 * Provides grep, wc, sort, uniq, cut, and tr utilities for terminal
 */

import { CommandResult } from '../parser.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse flags from arguments array
 * @param {string[]} args - Command arguments
 * @returns {{flags: Set<string>, positional: string[]}}
 */
function parseFlags(args) {
    const flags = new Set();
    const positional = [];

    for (const arg of args) {
        if (arg.startsWith('-') && arg.length > 1 && !arg.startsWith('--')) {
            // Handle combined flags like -in
            for (let i = 1; i < arg.length; i++) {
                flags.add(arg[i]);
            }
        } else if (!arg.startsWith('-')) {
            positional.push(arg);
        }
    }

    return { flags, positional };
}

/**
 * Parse flag with value (e.g., -d ',' or -f '1,3')
 * @param {string[]} args - Command arguments
 * @param {string} flag - Flag character to look for
 * @returns {string|null}
 */
function getFlagValue(args, flag) {
    for (let i = 0; i < args.length; i++) {
        if (args[i] === `-${flag}` && i + 1 < args.length) {
            return args[i + 1];
        }
    }
    return null;
}

/**
 * Read content from file or pipe input
 * @param {string|null} filename - File to read
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {string}
 */
function readInput(filename, filesystem, pipeInput) {
    if (pipeInput !== null) {
        return pipeInput;
    }

    if (!filename) {
        throw new Error('No input provided');
    }

    return filesystem.cat(filename);
}

// ============================================================================
// grep - Search for patterns in files
// ============================================================================

/**
 * Search for patterns in text
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Piped input from previous command
 * @returns {CommandResult}
 */
export function grep(args, filesystem, pipeInput = null) {
    try {
        if (args.length === 0) {
            return CommandResult.error('grep: missing pattern');
        }

        const { flags, positional } = parseFlags(args);

        // Extract pattern and files
        const pattern = positional[0];
        const files = positional.slice(1);

        if (!pattern) {
            return CommandResult.error('grep: missing pattern');
        }

        // Build regex flags
        let regexFlags = 'g';
        if (flags.has('i')) {
            regexFlags += 'i'; // Case insensitive
        }

        let regex;
        try {
            regex = new RegExp(pattern, regexFlags);
        } catch (e) {
            return CommandResult.error(`grep: invalid pattern: ${e.message}`);
        }

        const results = [];
        const showLineNumbers = flags.has('n');
        const invertMatch = flags.has('v');
        const recursive = flags.has('r');

        // Process piped input
        if (pipeInput !== null) {
            const lines = pipeInput.split('\n');
            lines.forEach((line, index) => {
                const matches = regex.test(line);
                regex.lastIndex = 0; // Reset regex state

                if (matches !== invertMatch) { // XOR logic for invert
                    if (showLineNumbers) {
                        results.push(`${index + 1}:${line}`);
                    } else {
                        results.push(line);
                    }
                }
            });

            return CommandResult.success(results.join('\n'));
        }

        // Process files
        if (files.length === 0) {
            return CommandResult.error('grep: no files specified (use pipe or provide filename)');
        }

        // Handle recursive search
        if (recursive) {
            for (const path of files) {
                if (filesystem.isDirectory(path)) {
                    const foundFiles = filesystem.find(path, '*');
                    for (const file of foundFiles) {
                        if (filesystem.isFile(file)) {
                            processFile(file, regex, invertMatch, showLineNumbers, files.length > 1, results, filesystem);
                        }
                    }
                } else {
                    processFile(path, regex, invertMatch, showLineNumbers, files.length > 1, results, filesystem);
                }
            }
        } else {
            for (const file of files) {
                processFile(file, regex, invertMatch, showLineNumbers, files.length > 1, results, filesystem);
            }
        }

        if (results.length === 0) {
            return CommandResult.error('', 1); // No matches, exit code 1
        }

        return CommandResult.success(results.join('\n'));
    } catch (error) {
        return CommandResult.error(`grep: ${error.message}`);
    }
}

/**
 * Process a single file for grep
 */
function processFile(file, regex, invertMatch, showLineNumbers, multipleFiles, results, filesystem) {
    try {
        const content = filesystem.cat(file);
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const matches = regex.test(line);
            regex.lastIndex = 0; // Reset regex state

            if (matches !== invertMatch) {
                let output = '';
                if (multipleFiles) {
                    output += `${file}:`;
                }
                if (showLineNumbers) {
                    output += `${index + 1}:`;
                }
                output += line;
                results.push(output);
            }
        });
    } catch (error) {
        results.push(`grep: ${file}: ${error.message}`);
    }
}

// ============================================================================
// wc - Word, line, character count
// ============================================================================

/**
 * Count words, lines, and characters
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Piped input from previous command
 * @returns {CommandResult}
 */
export function wc(args, filesystem, pipeInput = null) {
    try {
        const { flags, positional } = parseFlags(args);

        const countLines = flags.has('l');
        const countWords = flags.has('w');
        const countChars = flags.has('c');

        // If no flags specified, show all counts
        const showAll = !countLines && !countWords && !countChars;

        const results = [];

        // Process piped input
        if (pipeInput !== null) {
            const counts = getCounts(pipeInput);
            const output = formatCounts(counts, showAll, countLines, countWords, countChars);
            return CommandResult.success(output);
        }

        // Process files
        if (positional.length === 0) {
            return CommandResult.error('wc: no files specified (use pipe or provide filename)');
        }

        let totalLines = 0;
        let totalWords = 0;
        let totalChars = 0;

        for (const file of positional) {
            try {
                const content = filesystem.cat(file);
                const counts = getCounts(content);

                totalLines += counts.lines;
                totalWords += counts.words;
                totalChars += counts.chars;

                const output = formatCounts(counts, showAll, countLines, countWords, countChars, file);
                results.push(output);
            } catch (error) {
                results.push(`wc: ${file}: ${error.message}`);
            }
        }

        // Show totals if multiple files
        if (positional.length > 1) {
            const totalCounts = { lines: totalLines, words: totalWords, chars: totalChars };
            const output = formatCounts(totalCounts, showAll, countLines, countWords, countChars, 'total');
            results.push(output);
        }

        return CommandResult.success(results.join('\n'));
    } catch (error) {
        return CommandResult.error(`wc: ${error.message}`);
    }
}

/**
 * Get line, word, and character counts from text
 */
function getCounts(text) {
    const lines = text.split('\n').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;

    return { lines, words, chars };
}

/**
 * Format counts for output
 */
function formatCounts(counts, showAll, showLines, showWords, showChars, filename = null) {
    const parts = [];

    if (showAll || showLines) {
        parts.push(counts.lines.toString().padStart(7));
    }
    if (showAll || showWords) {
        parts.push(counts.words.toString().padStart(7));
    }
    if (showAll || showChars) {
        parts.push(counts.chars.toString().padStart(7));
    }

    if (filename) {
        parts.push(filename);
    }

    return parts.join(' ');
}

// ============================================================================
// sort - Sort lines of text
// ============================================================================

/**
 * Sort lines of text
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Piped input from previous command
 * @returns {CommandResult}
 */
export function sort(args, filesystem, pipeInput = null) {
    try {
        const { flags, positional } = parseFlags(args);

        const reverse = flags.has('r');
        const numeric = flags.has('n');

        let content;

        // Get input
        if (pipeInput !== null) {
            content = pipeInput;
        } else if (positional.length > 0) {
            content = filesystem.cat(positional[0]);
        } else {
            return CommandResult.error('sort: no input provided (use pipe or provide filename)');
        }

        const lines = content.split('\n');

        // Sort lines
        if (numeric) {
            lines.sort((a, b) => {
                const numA = parseFloat(a) || 0;
                const numB = parseFloat(b) || 0;
                return reverse ? numB - numA : numA - numB;
            });
        } else {
            lines.sort((a, b) => {
                const result = a.localeCompare(b);
                return reverse ? -result : result;
            });
        }

        return CommandResult.success(lines.join('\n'));
    } catch (error) {
        return CommandResult.error(`sort: ${error.message}`);
    }
}

// ============================================================================
// uniq - Remove duplicate lines
// ============================================================================

/**
 * Remove or count duplicate consecutive lines
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Piped input from previous command
 * @returns {CommandResult}
 */
export function uniq(args, filesystem, pipeInput = null) {
    try {
        const { flags, positional } = parseFlags(args);

        const showCount = flags.has('c');
        const onlyDuplicates = flags.has('d');

        let content;

        // Get input
        if (pipeInput !== null) {
            content = pipeInput;
        } else if (positional.length > 0) {
            content = filesystem.cat(positional[0]);
        } else {
            return CommandResult.error('uniq: no input provided (use pipe or provide filename)');
        }

        const lines = content.split('\n');
        const results = [];

        let currentLine = null;
        let count = 0;

        for (const line of lines) {
            if (line === currentLine) {
                count++;
            } else {
                // Output previous line if exists
                if (currentLine !== null) {
                    if (!onlyDuplicates || count > 1) {
                        if (showCount) {
                            results.push(`${count.toString().padStart(7)} ${currentLine}`);
                        } else {
                            results.push(currentLine);
                        }
                    }
                }
                currentLine = line;
                count = 1;
            }
        }

        // Output last line
        if (currentLine !== null) {
            if (!onlyDuplicates || count > 1) {
                if (showCount) {
                    results.push(`${count.toString().padStart(7)} ${currentLine}`);
                } else {
                    results.push(currentLine);
                }
            }
        }

        return CommandResult.success(results.join('\n'));
    } catch (error) {
        return CommandResult.error(`uniq: ${error.message}`);
    }
}

// ============================================================================
// cut - Extract columns from text
// ============================================================================

/**
 * Extract columns from text
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Piped input from previous command
 * @returns {CommandResult}
 */
export function cut(args, filesystem, pipeInput = null) {
    try {
        const { positional } = parseFlags(args);

        const delimiter = getFlagValue(args, 'd') || '\t';
        const fieldsStr = getFlagValue(args, 'f');

        if (!fieldsStr) {
            return CommandResult.error('cut: you must specify a list of fields with -f');
        }

        // Parse field specifications (e.g., "1,3" or "1-3")
        const fields = parseFieldSpec(fieldsStr);

        let content;

        // Get input
        if (pipeInput !== null) {
            content = pipeInput;
        } else if (positional.length > 0) {
            content = filesystem.cat(positional[0]);
        } else {
            return CommandResult.error('cut: no input provided (use pipe or provide filename)');
        }

        const lines = content.split('\n');
        const results = [];

        for (const line of lines) {
            const columns = line.split(delimiter);
            const selected = [];

            for (const fieldIndex of fields) {
                if (fieldIndex > 0 && fieldIndex <= columns.length) {
                    selected.push(columns[fieldIndex - 1]);
                }
            }

            results.push(selected.join(delimiter));
        }

        return CommandResult.success(results.join('\n'));
    } catch (error) {
        return CommandResult.error(`cut: ${error.message}`);
    }
}

/**
 * Parse field specification like "1,3,5" or "1-3,5"
 */
function parseFieldSpec(spec) {
    const fields = new Set();
    const parts = spec.split(',');

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
                fields.add(i);
            }
        } else {
            fields.add(parseInt(part.trim()));
        }
    }

    return Array.from(fields).sort((a, b) => a - b);
}

// ============================================================================
// tr - Translate or delete characters
// ============================================================================

/**
 * Translate or delete characters
 * @param {string[]} args - Command arguments
 * @param {string|null} pipeInput - Piped input from previous command
 * @returns {CommandResult}
 */
export function tr(args, pipeInput = null) {
    try {
        if (pipeInput === null) {
            return CommandResult.error('tr: requires piped input');
        }

        const { flags, positional } = parseFlags(args);
        const deleteMode = flags.has('d');

        if (deleteMode) {
            // Delete mode: remove characters in set1
            if (positional.length < 1) {
                return CommandResult.error('tr: missing operand');
            }

            const set1 = positional[0];
            let result = pipeInput;

            for (const char of set1) {
                result = result.split(char).join('');
            }

            return CommandResult.success(result);
        } else {
            // Translate mode: replace characters from set1 with set2
            if (positional.length < 2) {
                return CommandResult.error('tr: missing operand');
            }

            const set1 = positional[0];
            const set2 = positional[1];
            let result = pipeInput;

            // Build translation map
            const minLen = Math.min(set1.length, set2.length);
            for (let i = 0; i < minLen; i++) {
                const from = set1[i];
                const to = set2[i];
                result = result.split(from).join(to);
            }

            return CommandResult.success(result);
        }
    } catch (error) {
        return CommandResult.error(`tr: ${error.message}`);
    }
}
