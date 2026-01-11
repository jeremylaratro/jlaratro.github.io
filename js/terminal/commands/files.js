/**
 * File Command Handlers
 * Commands: cat, head, tail, less, file, stat
 */

import { CommandResult } from '../parser.js';

/**
 * Display file contents
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Input from pipe
 * @returns {CommandResult}
 */
export function cat(args, filesystem, pipeInput = null) {
    // Handle piped input
    if (pipeInput !== null) {
        // Check for -n flag (line numbers)
        const showLineNumbers = args.includes('-n');

        if (showLineNumbers) {
            const lines = pipeInput.split('\n');
            const numbered = lines.map((line, idx) => `${(idx + 1).toString().padStart(6, ' ')}  ${line}`).join('\n');
            return CommandResult.success(numbered);
        }

        return CommandResult.success(pipeInput);
    }

    // Parse arguments
    const flags = [];
    const files = [];

    for (const arg of args) {
        if (arg.startsWith('-')) {
            flags.push(arg);
        } else {
            files.push(arg);
        }
    }

    // Check for -n flag
    const showLineNumbers = flags.includes('-n');

    // Need at least one file
    if (files.length === 0) {
        return CommandResult.error('cat: missing file operand');
    }

    // Process each file
    const outputs = [];
    for (const file of files) {
        try {
            const content = filesystem.cat(file);

            if (showLineNumbers) {
                const lines = content.split('\n');
                const numbered = lines.map((line, idx) => `${(idx + 1).toString().padStart(6, ' ')}  ${line}`).join('\n');
                outputs.push(numbered);
            } else {
                outputs.push(content);
            }
        } catch (error) {
            return CommandResult.error(error.message);
        }
    }

    return CommandResult.success(outputs.join('\n\n'));
}

/**
 * Display first N lines of file or input
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Input from pipe
 * @returns {CommandResult}
 */
export function head(args, filesystem, pipeInput = null) {
    let numLines = 10; // Default
    let files = [];

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            numLines = parseInt(args[i + 1], 10);
            if (isNaN(numLines) || numLines < 0) {
                return CommandResult.error('head: invalid number of lines');
            }
            i++; // Skip next arg
        } else if (args[i].startsWith('-') && args[i].length > 1) {
            // Handle -n5 format
            const num = parseInt(args[i].substring(1), 10);
            if (!isNaN(num) && num >= 0) {
                numLines = num;
            }
        } else {
            files.push(args[i]);
        }
    }

    // Handle piped input
    if (pipeInput !== null) {
        const lines = pipeInput.split('\n');
        const result = lines.slice(0, numLines).join('\n');
        return CommandResult.success(result);
    }

    // Need at least one file
    if (files.length === 0) {
        return CommandResult.error('head: missing file operand');
    }

    // Process file
    try {
        const content = filesystem.cat(files[0]);
        const lines = content.split('\n');
        const result = lines.slice(0, numLines).join('\n');
        return CommandResult.success(result);
    } catch (error) {
        return CommandResult.error(error.message);
    }
}

/**
 * Display last N lines of file or input
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @param {string|null} pipeInput - Input from pipe
 * @returns {CommandResult}
 */
export function tail(args, filesystem, pipeInput = null) {
    let numLines = 10; // Default
    let files = [];

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            numLines = parseInt(args[i + 1], 10);
            if (isNaN(numLines) || numLines < 0) {
                return CommandResult.error('tail: invalid number of lines');
            }
            i++; // Skip next arg
        } else if (args[i].startsWith('-') && args[i].length > 1) {
            // Handle -n5 format
            const num = parseInt(args[i].substring(1), 10);
            if (!isNaN(num) && num >= 0) {
                numLines = num;
            }
        } else {
            files.push(args[i]);
        }
    }

    // Handle piped input
    if (pipeInput !== null) {
        const lines = pipeInput.split('\n');
        const result = lines.slice(-numLines).join('\n');
        return CommandResult.success(result);
    }

    // Need at least one file
    if (files.length === 0) {
        return CommandResult.error('tail: missing file operand');
    }

    // Process file
    try {
        const content = filesystem.cat(files[0]);
        const lines = content.split('\n');
        const result = lines.slice(-numLines).join('\n');
        return CommandResult.success(result);
    } catch (error) {
        return CommandResult.error(error.message);
    }
}

/**
 * Paginated view (simplified for web)
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @returns {CommandResult}
 */
export function less(args, filesystem) {
    if (args.length === 0) {
        return CommandResult.error('less: missing file operand');
    }

    try {
        const content = filesystem.cat(args[0]);
        const output = `${content}\n\n[Scroll to view more - 'q' or 'Esc' to return to terminal]`;
        return CommandResult.success(output);
    } catch (error) {
        return CommandResult.error(error.message);
    }
}

/**
 * Detect file type based on content
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @returns {CommandResult}
 */
export function file(args, filesystem) {
    if (args.length === 0) {
        return CommandResult.error('file: missing file operand');
    }

    const results = [];

    for (const path of args) {
        try {
            // Check if file exists
            if (!filesystem.exists(path)) {
                results.push(`${path}: cannot open (No such file or directory)`);
                continue;
            }

            // Check if it's a directory
            if (filesystem.isDirectory(path)) {
                results.push(`${path}: directory`);
                continue;
            }

            // Get file content
            const content = filesystem.cat(path);
            const trimmed = content.trim();

            // Detect file type based on content
            let fileType = 'ASCII text';

            // Check for binary/archive signatures (magic bytes)
            if (content.startsWith('PK\x03\x04') || content.startsWith('PK')) {
                fileType = 'Zip archive data';
            }
            // PDF
            else if (content.startsWith('%PDF')) {
                fileType = 'PDF document';
            }
            // HTML
            else if (content.match(/^<!DOCTYPE\s+html/i) || content.match(/^<html/i)) {
                fileType = 'HTML document';
            }
            // XML
            else if (content.startsWith('<?xml')) {
                fileType = 'XML document';
            }
            // JSON
            else if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
                     (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                try {
                    JSON.parse(trimmed);
                    fileType = 'JSON data';
                } catch (e) {
                    fileType = 'ASCII text';
                }
            }
            // Shell script
            else if (content.startsWith('#!')) {
                const firstLine = content.split('\n')[0];
                if (firstLine.includes('bash')) {
                    fileType = 'Bash script';
                } else if (firstLine.includes('python')) {
                    fileType = 'Python script';
                } else if (firstLine.includes('sh')) {
                    fileType = 'Shell script';
                } else {
                    fileType = 'script';
                }
            }
            // Python
            else if (content.match(/^import\s+|^from\s+.*\s+import/m)) {
                fileType = 'Python script';
            }
            // Check for binary/non-printable characters
            else if (content.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/)) {
                fileType = 'data';
            }
            // Empty file
            else if (content.length === 0) {
                fileType = 'empty';
            }

            results.push(`${path}: ${fileType}`);
        } catch (error) {
            results.push(`${path}: ${error.message}`);
        }
    }

    return CommandResult.success(results.join('\n'));
}

/**
 * Display file or directory statistics
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @returns {CommandResult}
 */
export function stat(args, filesystem) {
    if (args.length === 0) {
        return CommandResult.error('stat: missing file operand');
    }

    const results = [];

    for (const path of args) {
        try {
            const info = filesystem.stat(path);

            const output = [
                `  File: ${info.name}`,
                `  Type: ${info.type}`,
                `  Size: ${info.size} bytes`,
                `  Permissions: ${info.permissions}`,
                `  Created: ${new Date(info.createdAt).toLocaleString()}`,
                `  Modified: ${new Date(info.modifiedAt).toLocaleString()}`,
                `  Path: ${info.path}`
            ].join('\n');

            results.push(output);
        } catch (error) {
            results.push(`stat: cannot stat '${path}': ${error.message}`);
        }
    }

    return CommandResult.success(results.join('\n\n'));
}
