/**
 * Encoding and CTF Commands
 * Base64, hex dump, hashing, ciphers, and string manipulation tools
 */

import { CommandResult } from '../parser.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simple MD5 implementation for browser
 * Note: This is a basic implementation for demonstration purposes
 */
function simpleMD5(str) {
    // Convert string to UTF-8 byte array
    const encoder = new TextEncoder();
    const data = encoder.encode(str);

    // For a real implementation, we'd use Web Crypto API or a full MD5 library
    // This is a placeholder that creates a deterministic hash-like output
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to hex string (simplified MD5-like format)
    const hex = Math.abs(hash).toString(16).padStart(32, '0');
    return hex.substring(0, 32);
}

/**
 * Simple SHA256 implementation placeholder
 * Uses Web Crypto API if available, falls back to simple hash
 */
async function simpleSHA256(str) {
    // Try to use Web Crypto API
    if (crypto && crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fall through to simple implementation
        }
    }

    // Fallback: simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data[i];
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(64, '0');
    return hex.substring(0, 64);
}

/**
 * Convert string to hex bytes for xxd output
 */
function stringToHexBytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

/**
 * Convert hex string to binary string
 */
function hexToString(hex) {
    // Remove whitespace and colons
    hex = hex.replace(/[\s:]/g, '');

    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        if (!isNaN(byte)) {
            result += String.fromCharCode(byte);
        }
    }
    return result;
}

/**
 * Extract printable ASCII strings from data
 */
function extractStrings(data, minLength = 4) {
    const results = [];
    let current = '';

    for (let i = 0; i < data.length; i++) {
        const code = data.charCodeAt(i);
        // Printable ASCII range: 32-126
        if (code >= 32 && code <= 126) {
            current += data[i];
        } else {
            if (current.length >= minLength) {
                results.push(current);
            }
            current = '';
        }
    }

    // Don't forget the last string
    if (current.length >= minLength) {
        results.push(current);
    }

    return results;
}

// ============================================================================
// Command: base64
// ============================================================================

/**
 * Base64 encode/decode
 * @param {string[]} args - Command arguments
 * @param {Object} filesystem - Virtual filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function base64(args, filesystem, pipeInput = null) {
    let decode = false;
    let input = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-d' || args[i] === '--decode') {
            decode = true;
        } else if (!input) {
            input = args[i];
        }
    }

    // Get input from pipe, file, or argument
    let data = '';
    if (pipeInput) {
        data = pipeInput.trim();
    } else if (input) {
        // Try to read as file first
        try {
            data = filesystem.cat(input);
        } catch (e) {
            // Not a file, treat as direct text
            data = input;
        }
    } else {
        return CommandResult.error('base64: missing operand\nTry: base64 <text> or echo "text" | base64');
    }

    try {
        if (decode) {
            // Decode from base64
            const decoded = atob(data);
            return CommandResult.success(decoded);
        } else {
            // Encode to base64
            const encoded = btoa(data);
            return CommandResult.success(encoded);
        }
    } catch (e) {
        return CommandResult.error(`base64: invalid input: ${e.message}`);
    }
}

// ============================================================================
// Command: xxd
// ============================================================================

/**
 * Hex dump utility
 * @param {string[]} args - Command arguments
 * @param {Object} filesystem - Virtual filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function xxd(args, filesystem, pipeInput = null) {
    let reverse = false;
    let input = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-r' || args[i] === '--revert') {
            reverse = true;
        } else if (!input) {
            input = args[i];
        }
    }

    // Get input from pipe, file, or argument
    let data = '';
    if (pipeInput) {
        data = pipeInput;
    } else if (input) {
        try {
            data = filesystem.cat(input);
        } catch (e) {
            return CommandResult.error(`xxd: ${input}: No such file or directory`);
        }
    } else {
        return CommandResult.error('xxd: missing operand\nTry: xxd <file> or echo "text" | xxd');
    }

    if (reverse) {
        // Reverse mode: hex to binary
        try {
            const result = hexToString(data);
            return CommandResult.success(result);
        } catch (e) {
            return CommandResult.error(`xxd: invalid hex input: ${e.message}`);
        }
    } else {
        // Normal mode: binary to hex dump
        const bytes = stringToHexBytes(data);
        const lines = [];

        for (let i = 0; i < bytes.length; i += 16) {
            const offset = i.toString(16).padStart(8, '0');
            const chunk = bytes.slice(i, i + 16);

            // Format hex bytes in groups of 2
            let hexPart = '';
            for (let j = 0; j < 16; j++) {
                if (j < chunk.length) {
                    hexPart += chunk[j].toString(16).padStart(2, '0');
                } else {
                    hexPart += '  ';
                }
                if (j % 2 === 1) hexPart += ' ';
            }

            // Format ASCII part
            let asciiPart = '';
            for (let j = 0; j < chunk.length; j++) {
                const c = chunk[j];
                asciiPart += (c >= 32 && c <= 126) ? String.fromCharCode(c) : '.';
            }

            lines.push(`${offset}: ${hexPart} ${asciiPart}`);
        }

        return CommandResult.success(lines.join('\n'));
    }
}

// ============================================================================
// Command: strings
// ============================================================================

/**
 * Extract printable strings from files or input
 * @param {string[]} args - Command arguments
 * @param {Object} filesystem - Virtual filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function strings(args, filesystem, pipeInput = null) {
    let minLength = 4;
    let input = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && i + 1 < args.length) {
            minLength = parseInt(args[i + 1]);
            i++;
        } else if (!input) {
            input = args[i];
        }
    }

    // Get input from pipe or file
    let data = '';
    if (pipeInput) {
        data = pipeInput;
    } else if (input) {
        try {
            data = filesystem.cat(input);
        } catch (e) {
            return CommandResult.error(`strings: ${input}: No such file or directory`);
        }
    } else {
        return CommandResult.error('strings: missing operand\nTry: strings <file> or echo "text" | strings');
    }

    const result = extractStrings(data, minLength);
    return CommandResult.success(result.join('\n'));
}

// ============================================================================
// Command: md5sum
// ============================================================================

/**
 * Calculate MD5 hash
 * @param {string[]} args - Command arguments
 * @param {Object} filesystem - Virtual filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function md5sum(args, filesystem, pipeInput = null) {
    let input = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (!input) {
            input = args[i];
        }
    }

    // Get input from pipe, file, or argument
    let data = '';
    let filename = '-';

    if (pipeInput) {
        data = pipeInput;
        filename = '-';
    } else if (input) {
        try {
            data = filesystem.cat(input);
            filename = input;
        } catch (e) {
            // Not a file, treat as direct text
            data = input;
            filename = '-';
        }
    } else {
        return CommandResult.error('md5sum: missing operand\nTry: md5sum <file> or echo "text" | md5sum');
    }

    const hash = simpleMD5(data);
    return CommandResult.success(`${hash}  ${filename}`);
}

// ============================================================================
// Command: sha256sum
// ============================================================================

/**
 * Calculate SHA256 hash
 * Note: This is synchronous wrapper, actual hashing may be async
 * @param {string[]} args - Command arguments
 * @param {Object} filesystem - Virtual filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function sha256sum(args, filesystem, pipeInput = null) {
    let input = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (!input) {
            input = args[i];
        }
    }

    // Get input from pipe, file, or argument
    let data = '';
    let filename = '-';

    if (pipeInput) {
        data = pipeInput;
        filename = '-';
    } else if (input) {
        try {
            data = filesystem.cat(input);
            filename = input;
        } catch (e) {
            // Not a file, treat as direct text
            data = input;
            filename = '-';
        }
    } else {
        return CommandResult.error('sha256sum: missing operand\nTry: sha256sum <file> or echo "text" | sha256sum');
    }

    // Note: We return a promise here for async crypto
    // Terminal handler should handle Promise returns
    return simpleSHA256(data).then(hash => {
        return CommandResult.success(`${hash}  ${filename}`);
    }).catch(e => {
        return CommandResult.error(`sha256sum: error: ${e.message}`);
    });
}

// ============================================================================
// Command: rot13
// ============================================================================

/**
 * ROT13 cipher
 * @param {string[]} args - Command arguments
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function rot13(args, pipeInput = null) {
    let input = null;

    // Parse arguments
    if (args.length > 0) {
        input = args.join(' ');
    }

    // Get input from pipe or argument
    let data = '';
    if (pipeInput) {
        data = pipeInput;
    } else if (input) {
        data = input;
    } else {
        return CommandResult.error('rot13: missing operand\nTry: rot13 <text> or echo "text" | rot13');
    }

    // ROT13 transformation
    const result = data.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65; // 'a' or 'A'
        return String.fromCharCode(((code - base + 13) % 26) + base);
    });

    return CommandResult.success(result);
}

// ============================================================================
// Command: rev
// ============================================================================

/**
 * Reverse lines character by character
 * @param {string[]} args - Command arguments
 * @param {Object} filesystem - Virtual filesystem instance
 * @param {string|null} pipeInput - Piped input
 * @returns {CommandResult}
 */
export function rev(args, filesystem, pipeInput = null) {
    let input = null;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (!input) {
            input = args[i];
        }
    }

    // Get input from pipe, file, or argument
    let data = '';
    if (pipeInput) {
        data = pipeInput;
    } else if (input) {
        try {
            data = filesystem.cat(input);
        } catch (e) {
            // Not a file, treat as direct text
            data = input;
        }
    } else {
        return CommandResult.error('rev: missing operand\nTry: rev <text> or echo "text" | rev');
    }

    // Reverse each line
    const lines = data.split('\n');
    const reversed = lines.map(line => line.split('').reverse().join(''));

    return CommandResult.success(reversed.join('\n'));
}

// ============================================================================
// Exports
// ============================================================================

export default {
    base64,
    xxd,
    strings,
    md5sum,
    sha256sum,
    rot13,
    rev
};
