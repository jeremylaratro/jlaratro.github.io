/**
 * Virtual Filesystem Implementation
 * Based on iOScTF patterns with immutable tree structure
 */

// ============================================================================
// FSNode Base Class
// ============================================================================

class FSNode {
    constructor(name, type = 'file') {
        this.name = name;
        this.type = type; // 'file' or 'directory'
        this.createdAt = new Date().toISOString();
        this.modifiedAt = new Date().toISOString();
        this.permissions = type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
    }

    updateModified() {
        this.modifiedAt = new Date().toISOString();
    }
}

// ============================================================================
// VirtualFile Class
// ============================================================================

class VirtualFile extends FSNode {
    constructor(name, content = '', mimeType = 'text/plain') {
        super(name, 'file');
        this.content = content;
        this.mimeType = mimeType;
    }

    get size() {
        return new Blob([this.content]).size;
    }

    setContent(content) {
        this.content = content;
        this.updateModified();
    }
}

// ============================================================================
// VirtualDirectory Class
// ============================================================================

class VirtualDirectory extends FSNode {
    constructor(name) {
        super(name, 'directory');
        this.children = new Map();
    }

    addChild(node) {
        this.children.set(node.name, node);
        this.updateModified();
    }

    removeChild(name) {
        const result = this.children.delete(name);
        if (result) {
            this.updateModified();
        }
        return result;
    }

    getChild(name) {
        return this.children.get(name);
    }

    hasChild(name) {
        return this.children.has(name);
    }

    // Immutable copy with modifications
    copyWith(modifications = {}) {
        const copy = new VirtualDirectory(this.name);
        copy.createdAt = this.createdAt;
        copy.modifiedAt = modifications.updateModified ? new Date().toISOString() : this.modifiedAt;
        copy.permissions = this.permissions;

        // Deep copy children
        this.children.forEach((child, name) => {
            if (child instanceof VirtualDirectory) {
                copy.children.set(name, child.copyWith());
            } else {
                const fileCopy = new VirtualFile(child.name, child.content, child.mimeType);
                fileCopy.createdAt = child.createdAt;
                fileCopy.modifiedAt = child.modifiedAt;
                fileCopy.permissions = child.permissions;
                copy.children.set(name, fileCopy);
            }
        });

        return copy;
    }

    get size() {
        return this.children.size;
    }
}

// ============================================================================
// VirtualFilesystem Class
// ============================================================================

export class VirtualFilesystem {
    constructor() {
        this.root = this._createInitialStructure();
        this.currentDirectory = '/home/user';
        this.homeDirectory = '/home/user';
    }

    // ========================================================================
    // Path Resolution
    // ========================================================================

    resolvePath(path) {
        // Handle empty or undefined paths
        if (!path || path.trim() === '') {
            return this.currentDirectory;
        }

        // Expand tilde to home directory
        if (path.startsWith('~')) {
            path = path.replace('~', this.homeDirectory);
        }

        // If absolute path, start from root
        if (path.startsWith('/')) {
            return this._normalizePath(path);
        }

        // Relative path - resolve from current directory
        const fullPath = `${this.currentDirectory}/${path}`;
        return this._normalizePath(fullPath);
    }

    _normalizePath(path) {
        // Split path and process . and ..
        const parts = path.split('/').filter(p => p !== '');
        const normalized = [];

        for (const part of parts) {
            if (part === '.') {
                continue; // Current directory, skip
            } else if (part === '..') {
                normalized.pop(); // Parent directory, go up
            } else {
                normalized.push(part);
            }
        }

        return '/' + normalized.join('/');
    }

    _getNodeAtPath(path) {
        const resolvedPath = this.resolvePath(path);

        if (resolvedPath === '/') {
            return this.root;
        }

        const parts = resolvedPath.split('/').filter(p => p !== '');
        let current = this.root;

        for (const part of parts) {
            if (!(current instanceof VirtualDirectory)) {
                return null;
            }
            current = current.getChild(part);
            if (!current) {
                return null;
            }
        }

        return current;
    }

    _getParentAndName(path) {
        const resolvedPath = this.resolvePath(path);
        const parts = resolvedPath.split('/').filter(p => p !== '');

        if (parts.length === 0) {
            return { parent: null, name: '' };
        }

        const name = parts.pop();
        const parentPath = parts.length > 0 ? '/' + parts.join('/') : '/';
        const parent = this._getNodeAtPath(parentPath);

        return { parent, name };
    }

    // ========================================================================
    // Core Commands
    // ========================================================================

    pwd() {
        return this.currentDirectory;
    }

    cd(path = '~') {
        const resolvedPath = this.resolvePath(path);
        const node = this._getNodeAtPath(resolvedPath);

        if (!node) {
            throw new Error(`cd: ${path}: No such file or directory`);
        }

        if (!(node instanceof VirtualDirectory)) {
            throw new Error(`cd: ${path}: Not a directory`);
        }

        this.currentDirectory = resolvedPath;
        return resolvedPath;
    }

    ls(path = '.') {
        const resolvedPath = this.resolvePath(path);
        const node = this._getNodeAtPath(resolvedPath);

        if (!node) {
            throw new Error(`ls: cannot access '${path}': No such file or directory`);
        }

        if (node instanceof VirtualFile) {
            return [{
                name: node.name,
                type: 'file',
                size: node.size,
                permissions: node.permissions,
                modifiedAt: node.modifiedAt
            }];
        }

        const entries = [];
        node.children.forEach((child, name) => {
            entries.push({
                name: name,
                type: child.type,
                size: child instanceof VirtualFile ? child.size : child.children.size,
                permissions: child.permissions,
                modifiedAt: child.modifiedAt
            });
        });

        // Sort: directories first, then alphabetically
        entries.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

        return entries;
    }

    cat(path) {
        const node = this._getNodeAtPath(path);

        if (!node) {
            throw new Error(`cat: ${path}: No such file or directory`);
        }

        if (!(node instanceof VirtualFile)) {
            throw new Error(`cat: ${path}: Is a directory`);
        }

        return node.content;
    }

    stat(path) {
        const resolvedPath = this.resolvePath(path);
        const node = this._getNodeAtPath(resolvedPath);

        if (!node) {
            throw new Error(`stat: cannot stat '${path}': No such file or directory`);
        }

        return {
            name: node.name,
            type: node.type,
            size: node instanceof VirtualFile ? node.size : node.children.size,
            permissions: node.permissions,
            createdAt: node.createdAt,
            modifiedAt: node.modifiedAt,
            path: resolvedPath
        };
    }

    // ========================================================================
    // File/Directory Checks
    // ========================================================================

    exists(path) {
        return this._getNodeAtPath(path) !== null;
    }

    isDirectory(path) {
        const node = this._getNodeAtPath(path);
        return node instanceof VirtualDirectory;
    }

    isFile(path) {
        const node = this._getNodeAtPath(path);
        return node instanceof VirtualFile;
    }

    fileExists(path) {
        const node = this._getNodeAtPath(path);
        return node instanceof VirtualFile;
    }

    readFile(path) {
        return this.cat(path);
    }

    // ========================================================================
    // File Operations
    // ========================================================================

    writeFile(path, content) {
        const { parent, name } = this._getParentAndName(path);

        if (!parent) {
            throw new Error(`writeFile: cannot create file '${path}': No such file or directory`);
        }

        if (!(parent instanceof VirtualDirectory)) {
            throw new Error(`writeFile: cannot create file '${path}': Not a directory`);
        }

        // Check if file already exists
        const existing = parent.getChild(name);
        if (existing) {
            if (!(existing instanceof VirtualFile)) {
                throw new Error(`writeFile: cannot create file '${path}': Is a directory`);
            }
            existing.setContent(content);
        } else {
            const newFile = new VirtualFile(name, content);
            parent.addChild(newFile);
        }

        return true;
    }

    mkdir(path) {
        const { parent, name } = this._getParentAndName(path);

        if (!parent) {
            throw new Error(`mkdir: cannot create directory '${path}': No such file or directory`);
        }

        if (!(parent instanceof VirtualDirectory)) {
            throw new Error(`mkdir: cannot create directory '${path}': Not a directory`);
        }

        if (parent.hasChild(name)) {
            throw new Error(`mkdir: cannot create directory '${path}': File exists`);
        }

        const newDir = new VirtualDirectory(name);
        parent.addChild(newDir);
        return true;
    }

    rm(path, recursive = false) {
        const { parent, name } = this._getParentAndName(path);

        if (!parent) {
            throw new Error(`rm: cannot remove '${path}': No such file or directory`);
        }

        const node = parent.getChild(name);
        if (!node) {
            throw new Error(`rm: cannot remove '${path}': No such file or directory`);
        }

        if (node instanceof VirtualDirectory) {
            if (!recursive && node.children.size > 0) {
                throw new Error(`rm: cannot remove '${path}': Directory not empty (use -r for recursive)`);
            }
        }

        parent.removeChild(name);
        return true;
    }

    // ========================================================================
    // Search Operations
    // ========================================================================

    find(path = '.', pattern = '*') {
        const resolvedPath = this.resolvePath(path);
        const node = this._getNodeAtPath(resolvedPath);

        if (!node) {
            throw new Error(`find: '${path}': No such file or directory`);
        }

        if (!(node instanceof VirtualDirectory)) {
            throw new Error(`find: '${path}': Not a directory`);
        }

        const results = [];
        const regex = this._globToRegex(pattern);

        const traverse = (dir, currentPath) => {
            dir.children.forEach((child, name) => {
                const fullPath = `${currentPath}/${name}`;

                if (regex.test(name)) {
                    results.push(fullPath);
                }

                if (child instanceof VirtualDirectory) {
                    traverse(child, fullPath);
                }
            });
        };

        traverse(node, resolvedPath);
        return results;
    }

    grep(pattern, path = '.', recursive = false) {
        const resolvedPath = this.resolvePath(path);
        const node = this._getNodeAtPath(resolvedPath);

        if (!node) {
            throw new Error(`grep: ${path}: No such file or directory`);
        }

        const results = [];
        const regex = new RegExp(pattern, 'gi');

        const searchFile = (file, filePath) => {
            const lines = file.content.split('\n');
            lines.forEach((line, index) => {
                if (regex.test(line)) {
                    results.push({
                        file: filePath,
                        line: index + 1,
                        content: line.trim()
                    });
                }
            });
        };

        const traverse = (current, currentPath) => {
            if (current instanceof VirtualFile) {
                searchFile(current, currentPath);
            } else if (current instanceof VirtualDirectory) {
                current.children.forEach((child, name) => {
                    const fullPath = `${currentPath}/${name}`;
                    if (child instanceof VirtualFile) {
                        searchFile(child, fullPath);
                    } else if (recursive && child instanceof VirtualDirectory) {
                        traverse(child, fullPath);
                    }
                });
            }
        };

        traverse(node, resolvedPath);
        return results;
    }

    _globToRegex(pattern) {
        // Convert glob pattern to regex
        let regexStr = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexStr}$`, 'i');
    }

    // ========================================================================
    // Utility Methods
    // ========================================================================

    reset() {
        this.root = this._createInitialStructure();
        this.currentDirectory = '/home/user';
    }

    // ========================================================================
    // Initial Filesystem Structure
    // ========================================================================

    _createInitialStructure() {
        const root = new VirtualDirectory('');

        // /home
        const home = new VirtualDirectory('home');
        const user = new VirtualDirectory('user');

        // /home/user/readme.txt
        const readme = new VirtualFile('readme.txt',
`Welcome to my Cybersecurity Portfolio Terminal!

This interactive terminal provides access to my projects, research, and experience.

Quick Start:
  ls              - List files in current directory
  cat <file>      - Display file contents
  cd <directory>  - Change directory
  help            - Show available commands

Notable Directories:
  ~/cyberops      - Cybersecurity operations projects
  ~/research      - Technical research and experiments
  ~/intel         - CTF writeups and technical notes
  ~/about         - Professional profile and certifications

Type 'help' for a full list of commands.
`);
        user.addChild(readme);

        // /home/user/cyberops/
        const cyberops = new VirtualDirectory('cyberops');
        cyberops.addChild(new VirtualFile('cyberquizzer.txt',
`CyberQuizzer - Security Training Platform

A web-based cybersecurity training platform with gamified quizzes and challenges.

Features:
  - Interactive quiz system with real-time scoring
  - Multiple difficulty levels (Beginner, Intermediate, Advanced)
  - Topics: Network Security, Cryptography, Web Security, System Security
  - Progress tracking and achievement system

Tech Stack: JavaScript, HTML5, CSS3, Local Storage API
Status: Active Development
`));
        cyberops.addChild(new VirtualFile('purplesploit.txt',
`PurpleSploit - Purple Team Framework

A comprehensive framework for red and blue team exercises combining offensive and defensive security techniques.

Features:
  - Attack simulation modules
  - Defense mechanism testing
  - Automated vulnerability assessment
  - Detailed reporting and analytics

Tech Stack: Python, Metasploit, PowerShell
Status: In Progress
`));
        user.addChild(cyberops);

        // /home/user/research/
        const research = new VirtualDirectory('research');
        const hardware = new VirtualDirectory('hardware');
        const radio = new VirtualDirectory('radio');
        const chemistry = new VirtualDirectory('chemistry');
        research.addChild(hardware);
        research.addChild(radio);
        research.addChild(chemistry);
        user.addChild(research);

        // /home/user/intel/
        const intel = new VirtualDirectory('intel');
        const ctfWriteups = new VirtualDirectory('ctf-writeups');
        const technicalNotes = new VirtualDirectory('technical-notes');
        intel.addChild(ctfWriteups);
        intel.addChild(technicalNotes);
        user.addChild(intel);

        // /home/user/about/
        const about = new VirtualDirectory('about');
        about.addChild(new VirtualFile('profile.txt',
`=== Professional Profile ===

Name: Jeremy Laratro
Role: Cybersecurity Professional
Focus: Offensive Security, Purple Teaming, Security Research

Areas of Expertise:
  • Penetration Testing & Vulnerability Assessment
  • Red Team Operations & Attack Simulation
  • Security Tool Development
  • Incident Response & Digital Forensics
  • Network Security & System Hardening

Current Activities:
  • Developing security training platforms
  • CTF competitions and writeups
  • Open-source security tool contributions
  • Continuous learning and certification pursuit

Contact: Available via portfolio website
`));
        about.addChild(new VirtualFile('certifications.txt',
`=== Certifications & Training ===

[Placeholder for certifications]

Continuous Learning:
  • Regular CTF participation
  • Security research and experimentation
  • Open-source contributions
  • Technical blog writing

Skills Development:
  • Offensive Security techniques
  • Defensive Security strategies
  • Security automation and scripting
  • Threat intelligence analysis
`));
        user.addChild(about);

        home.addChild(user);
        root.addChild(home);

        // /etc
        const etc = new VirtualDirectory('etc');
        etc.addChild(new VirtualFile('passwd',
`root:x:0:0:root:/root:/bin/bash
user:x:1000:1000:Portfolio User:/home/user:/bin/bash
`));
        etc.addChild(new VirtualFile('hosts',
`127.0.0.1   localhost
127.0.1.1   cyber-portfolio
::1         localhost ip6-localhost ip6-loopback
`));
        root.addChild(etc);

        // /tmp
        const tmp = new VirtualDirectory('tmp');
        root.addChild(tmp);

        return root;
    }
}

export default VirtualFilesystem;
