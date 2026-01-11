/**
 * Navigation Commands for Portfolio Terminal
 * Implements pwd, cd, and ls with Unix-like behavior
 */

import { CommandResult } from '../parser.js';

/**
 * pwd - Print working directory
 * @param {VirtualFilesystem} filesystem - The virtual filesystem instance
 * @returns {CommandResult} Current directory path
 */
export function pwd(filesystem) {
    return CommandResult.success(filesystem.pwd());
}

/**
 * cd - Change directory
 * @param {string[]} args - Command arguments (path)
 * @param {VirtualFilesystem} filesystem - The virtual filesystem instance
 * @returns {CommandResult} Success or error result
 */
export function cd(args, filesystem) {
    const path = args.length > 0 ? args[0] : '~';

    try {
        filesystem.cd(path);
        return CommandResult.success('');
    } catch (error) {
        return CommandResult.error(error.message);
    }
}

/**
 * ls - List directory contents
 * @param {string[]} args - Command arguments (flags and path)
 * @param {VirtualFilesystem} filesystem - The virtual filesystem instance
 * @returns {CommandResult} Formatted directory listing
 */
export function ls(args, filesystem) {
    // Parse flags and path
    let showLong = false;
    let showAll = false;
    let targetPath = '.';

    for (const arg of args) {
        if (arg.startsWith('-')) {
            // Parse flags
            if (arg.includes('l')) showLong = true;
            if (arg.includes('a')) showAll = true;
        } else {
            // First non-flag argument is the path
            targetPath = arg;
        }
    }

    try {
        const entries = filesystem.ls(targetPath);

        // Filter hidden entries if -a not specified
        let displayEntries = entries;
        if (showAll) {
            // Add . and .. entries
            const resolvedPath = filesystem.resolvePath(targetPath);
            displayEntries = [
                {
                    name: '.',
                    type: 'directory',
                    size: entries.length,
                    permissions: 'drwxr-xr-x',
                    modifiedAt: new Date().toISOString()
                },
                {
                    name: '..',
                    type: 'directory',
                    size: 0,
                    permissions: 'drwxr-xr-x',
                    modifiedAt: new Date().toISOString()
                },
                ...entries
            ];
        }

        // Format output
        if (showLong) {
            return CommandResult.success(formatLongListing(displayEntries));
        } else {
            return CommandResult.success(formatSimpleListing(displayEntries));
        }
    } catch (error) {
        return CommandResult.error(error.message);
    }
}

/**
 * Format simple directory listing (default)
 * @param {Array} entries - Directory entries
 * @returns {string} HTML-formatted listing
 */
function formatSimpleListing(entries) {
    if (entries.length === 0) {
        return '';
    }

    const items = entries.map(entry => {
        const cssClass = entry.type === 'directory' ? 'ls-directory' : 'ls-file';
        return `<span class="${cssClass}">${entry.name}</span>`;
    });

    return items.join('  ');
}

/**
 * Format long directory listing (-l flag)
 * @param {Array} entries - Directory entries
 * @returns {string} HTML-formatted long listing
 */
function formatLongListing(entries) {
    if (entries.length === 0) {
        return '';
    }

    const lines = entries.map(entry => {
        const permissions = entry.permissions || (entry.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
        const size = formatSize(entry.size);
        const date = formatDate(entry.modifiedAt);
        const cssClass = entry.type === 'directory' ? 'ls-directory' : 'ls-file';

        // Format: permissions  links  user  group  size  date  name
        return `<span class="ls-permissions">${permissions}</span>  1  user  user  <span class="ls-size">${size}</span>  <span class="ls-date">${date}</span>  <span class="${cssClass}">${entry.name}</span>`;
    });

    return lines.join('\n');
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatSize(bytes) {
    if (bytes === undefined || bytes === null) {
        return '0';
    }

    // Pad size to 6 characters for alignment
    return String(bytes).padStart(6, ' ');
}

/**
 * Format date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date string (MMM DD HH:MM)
 */
function formatDate(isoDate) {
    if (!isoDate) {
        return 'Jan  1 00:00';
    }

    const date = new Date(isoDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, ' ');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month} ${day} ${hours}:${minutes}`;
}
