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
  ~/cyberops      - Cybersecurity tools & frameworks
  ~/research      - Hardware, radio, and chemistry projects
  ~/intel         - CTF writeups and technical notes
  ~/about         - Professional profile and certifications

Type 'help' for a full list of commands.
`);
        user.addChild(readme);

        // Hidden flag
        user.addChild(new VirtualFile('.flag.txt',
`Congratulations! You found the hidden flag.

FLAG{w3lc0m3_t0_th3_t3rm1n4l_h4ck3r}

You've demonstrated curiosity and basic enumeration skills - key traits
for any security professional. Keep exploring!
`));

        // ====================================================================
        // /home/user/cyberops/ - All cyber security projects
        // ====================================================================
        const cyberops = new VirtualDirectory('cyberops');

        // DHM
        cyberops.addChild(new VirtualFile('dhm.txt',
`Dependency Health Monitor (DHM)
================================================================================
GitHub: https://github.com/jeremylaratro/dhm

Python tool for comprehensive dependency health assessments. Calculates weighted
health scores across security, maintenance, community, and popularity metrics.

Features:
  - OSV vulnerability scanning integration
  - Weighted health scoring (A-F grades)
  - License categorization and risk assessment
  - SQLite caching for performance
  - CI/CD-ready JSON output

Tech Stack: Python, PyPI, OSV API
Status: Active - Published on PyPI
`));

        // Polybar Widgets
        cyberops.addChild(new VirtualFile('polybar-widgets.txt',
`Polybar Widgets
================================================================================
GitHub: https://github.com/jeremylaratro/polybar_widgets

Custom Polybar widgets for Linux desktop security monitoring and system utilities.

Widgets Included:
  - Flameshot screenshot integration
  - Docker container status
  - System uptime display
  - Screen brightness control
  - IDS alert notifications
  - VPN connection status
  - System update checker
  - IP information display

Tech Stack: Shell, Polybar, Linux
Status: Active
`));

        // LSS
        cyberops.addChild(new VirtualFile('lss.txt',
`Linux Security Suite (LSS)
================================================================================
GitHub: https://github.com/jeremylaratro/lss

Unified desktop security dashboard consolidating multiple security tools into
a single monitoring interface with threat intelligence integration.

Core Components:
  - Suricata/Snort IDS integration
  - ClamAV antivirus monitoring
  - Firewall management
  - Real-time network monitoring
  - JA3/JA4 TLS fingerprinting
  - System hardening audits

Threat Intelligence:
  - VirusTotal API integration
  - AbuseIPDB lookups
  - AlienVault OTX feeds
  - ThreatFox IOC database

Tech Stack: Python, Suricata, ClamAV, Flask
Status: Active - Personal infrastructure deployment
`));

        // iCTF
        cyberops.addChild(new VirtualFile('ictf.txt',
`iCTF - Mobile CTF Platform
================================================================================
GitHub: https://github.com/jeremylaratro/iOScTF

Mobile cybersecurity CTF platform for iOS providing hands-on security challenges
without requiring jailbreak.

Challenge Categories:
  - Cryptography
  - Web Security
  - Forensics
  - Reverse Engineering
  - Network Challenges

Features:
  - Sandboxed execution environment
  - Built-in terminal emulator
  - Progress tracking and hints
  - Offline challenge support

Tech Stack: Dart, Flutter, iOS
Status: Private beta
`));

        // AugFly
        cyberops.addChild(new VirtualFile('augfly.txt',
`AugFly - AR Flight Tracking
================================================================================

Augmented reality flight tracking application. Point your camera at the sky
to see real-time flight information overlaid on aircraft.

Features:
  - ARKit integration for iOS
  - Live ADS-B data feeds
  - GPS positioning
  - Detailed flight information
  - Native performance optimization

Tech Stack: TypeScript, ARKit, ADS-B
Status: In Development
`));

        // PurpleSploit
        cyberops.addChild(new VirtualFile('purplesploit.txt',
`PurpleSploit - Pentesting Workflow Framework
================================================================================
GitHub: https://github.com/jeremylaratro/Purplesploit

A framework for ultimate pentesting workflow efficiency with centralized
credential and target management.

Features:
  - SQLite-based credential/hash management
  - Nmap XML parsing for service enumeration
  - fzf-powered interactive selection menus
  - Ligolo-ng proxy tunneling integration
  - Automated exploit module system

Tech Stack: Python, SQLite, Flask
Status: Active development
`));

        // ArgusCloud
        cyberops.addChild(new VirtualFile('arguscloud.txt',
`ArgusCloud - Cloud Attack Path Generator
================================================================================
GitHub: https://github.com/jeremylaratro/ArgusCloud

Full-featured cloud-focused attack-path generation and graphing toolkit
for identifying privilege escalation paths in cloud infrastructure.

Supported Platforms:
  - AWS (IAM, EC2, S3, Lambda)
  - Azure (AD, VMs, Storage)
  - GCP (IAM, Compute, Storage)

Features:
  - Attack path visualization
  - Privilege escalation detection
  - Resource relationship mapping
  - Export to Neo4j/BloodHound format

Tech Stack: Python, AWS/Azure/GCP APIs
Status: Active development
`));

        // ThreatMobile
        cyberops.addChild(new VirtualFile('threatmobile.txt',
`ThreatMobile - Mobile Threat Intelligence
================================================================================

Mobile threat intelligence application for security analysts with real-time
IOC lookups and threat feed aggregation.

Data Sources:
  - VirusTotal
  - AlienVault OTX
  - ThreatFox
  - AbuseIPDB

Features:
  - Real-time IOC lookups
  - CVE tracking and alerts
  - Watchlist management
  - Push notifications for matches

Tech Stack: Go, Mobile
Status: In Development
`));

        // GrepEx
        cyberops.addChild(new VirtualFile('grepex.txt',
`GrepEx - Regex & Search Dork Generator
================================================================================
GitHub: https://github.com/jeremylaratro/grepex

iOS app for security researchers to generate regex patterns and search dorks
with extensive template library.

Features:
  - 80+ pre-built regex templates
  - 21 programming language outputs
  - GHDB integration (3600+ dorks)
  - Live pattern testing
  - ReDoS protection
  - Gamification with achievements

Tech Stack: TypeScript, iOS
Status: App Store release planned
`));

        // Quantsploit
        cyberops.addChild(new VirtualFile('quantsploit.txt',
`Quantsploit - Quantitative Trading Framework
================================================================================
GitHub: https://github.com/jeremylaratro/Quantsploit

Modular quantitative trading framework inspired by Metasploit with interactive
TUI and comprehensive technical analysis.

Technical Indicators:
  - RSI, MACD, SMA, EMA
  - Bollinger Bands
  - Stochastic Oscillator

Features:
  - Interactive TUI with auto-completion
  - Multi-stock market scanning
  - Options chain analysis with Greeks
  - Strategy backtesting engine

Tech Stack: Python, Rich/Textual, NumPy, Pandas
Status: Active - Personal use
`));

        // GuacaMappy
        cyberops.addChild(new VirtualFile('guacamappy.txt',
`GuacaMappy - Apache Guacamole Mobile Client
================================================================================
GitHub: https://github.com/jeremylaratro/guacamappy

Cross-platform mobile client for Apache Guacamole remote desktop gateway.

Supported Protocols:
  - RDP (Remote Desktop Protocol)
  - VNC (Virtual Network Computing)
  - SSH (Secure Shell)
  - Telnet

Features:
  - MFA/TOTP authentication
  - WebSocket tunneling
  - Touch-to-mouse input translation
  - Multi-session management

Tech Stack: Dart, Flutter
Status: Beta testing
`));

        // supwngo
        cyberops.addChild(new VirtualFile('supwngo.txt',
`supwngo - Automated Penetration Testing Utility
================================================================================
GitHub: https://github.com/jeremylaratro/supwngo

Automated penetration testing utility with autopwn capabilities designed to
streamline exploitation workflows.

Features:
  - Multi-threaded target discovery
  - Vulnerability matching
  - Automated exploitation
  - Credential reuse testing
  - Post-exploitation automation

Tech Stack: Python
Status: Internal tool
`));

        // Pentest Scripts
        cyberops.addChild(new VirtualFile('pentest-scripts.txt',
`Pentest Scripts (B-NEAS)
================================================================================
GitHub: https://github.com/jeremylaratro/pentest_scripts

Scripts designed for automation and streamlining of discovery and enumeration
tasks. Created during OSCP labs for maximum efficiency.

Modules:
  - Port scanning automation
  - Service enumeration
  - Web directory bruteforcing
  - SMB enumeration
  - DNS zone transfers

Tech Stack: Shell, Nmap
Status: Stable - OSCP tested
`));

        // SecureLLaMA
        cyberops.addChild(new VirtualFile('securellama.txt',
`SecureLLaMA - Secure LLaMA Deployment
================================================================================
GitHub: https://github.com/jeremylaratro/secureLLaMA

Secure implementation of open-source LLaMA LLM using Docker with proper
isolation and access controls for AI/ML workloads.

Features:
  - Docker containerization
  - Network isolation
  - Access control configuration
  - Gradio web interface

Tech Stack: Shell, Docker, Python, Gradio
Status: Stable
`));

        // WinBins
        cyberops.addChild(new VirtualFile('winbins.txt',
`WinBins - Windows Red Team Binary Updater
================================================================================
GitHub: https://github.com/jeremylaratro/WinBins

Automated utility for maintaining up-to-date Windows pentesting binaries.

Managed Tools:
  - winPEAS, PowerUp, Seatbelt
  - Mimikatz, LaZagne, SharpDPAPI
  - Chisel, ligolo-ng, plink
  - Rubeus, Certify, SharpHound

Features:
  - GitHub release auto-updates
  - Binary integrity verification
  - Organized directory structure

Tech Stack: Python, GitHub API
Status: Stable
`));

        // Discord Auto Updater
        cyberops.addChild(new VirtualFile('discord-updater.txt',
`Discord Auto Updater
================================================================================
GitHub: https://github.com/jeremylaratro/Auto_Update_Discord_Linux

Shell script automation for Discord installations on Linux (Debian/Fedora).

Features:
  - Automatic installation
  - Update detection
  - Cron scheduling for weekly updates

Tech Stack: Shell, Linux
Status: Stable
`));

        // CyberQuizzer
        cyberops.addChild(new VirtualFile('cyberquizzer.txt',
`CyberQuizzer - Interview Preparation Platform
================================================================================

Interactive interview preparation platform with 135+ real-world security
challenges covering multiple domains.

Categories:
  - Penetration Testing (OSCP-style)
  - Blue Team Operations
  - Hardware Security
  - Network Security
  - Web Application Security

Features:
  - Progress tracking
  - Categorized topics
  - Detailed answer explanations

Tech Stack: HTML, JavaScript
Status: Live
`));

        // MCP-Kali-Server
        cyberops.addChild(new VirtualFile('mcp-kali.txt',
`MCP-Kali-Server Bridges
================================================================================
GitHub: https://github.com/jeremylaratro/MCP-Kali-Server_Bridges

Bridging MCP server to AI systems for AI-assisted penetration testing.

Supported AI Models:
  - OpenAI GPT-4
  - Anthropic Claude
  - Google Gemini
  - Local models (LM-Studio)

Features:
  - Terminal access via AI
  - Natural language tool invocation
  - Sandboxed execution

Tech Stack: Python, MCP SDK
Status: Experimental
`));

        // PhotoSec
        cyberops.addChild(new VirtualFile('photosec.txt',
`PhotoSec - Photo Metadata & Privacy Tool
================================================================================
GitHub: https://github.com/jeremylaratro/PhotoSec

Privacy-focused utility for analyzing and removing metadata from photos.

Features:
  - Bulk metadata removal
  - GPS coordinate extraction
  - EXIF data analysis
  - Steganography detection

Tech Stack: Python, ExifTool, Binwalk
Status: Stable
`));

        // Securicoder
        cyberops.addChild(new VirtualFile('securicoder.txt',
`Securicoder - AI Code Security Analysis
================================================================================
URL: https://securicoder.com

Full-stack web application using OpenAI API for static code analysis on
user-submitted code.

Features:
  - OWASP Top 10 detection
  - Secret detection
  - Code quality analysis
  - Natural language explanations

Tech Stack: Django, OpenAI API, Snort
Status: Production
`));

        user.addChild(cyberops);

        // ====================================================================
        // /home/user/research/ - Hardware, Radio, Chemistry
        // ====================================================================
        const research = new VirtualDirectory('research');

        // Hardware subdirectory
        const hardware = new VirtualDirectory('hardware');
        hardware.addChild(new VirtualFile('mini-cnc.txt',
`Mini-CNC Machine with GRBL Controller
================================================================================

Built using aluminum extrusion, stepper motors, 10k rpm spindle motor, and
open-source GRBL control board. Total cost under $200.

Components:
  - Aluminum extrusion frame
  - NEMA17 stepper motors
  - GRBL CNC controller
  - 10,000 RPM spindle

Software: GRBL, bCNC, KiCAD for PCB design
`));
        hardware.addChild(new VirtualFile('gps-speedometer.txt',
`GPS Speedometer for Boat/Bike
================================================================================

Started with Arduino Uno prototyping, then migrated to standalone ATMEGA328P
with NEO-6M GPS Module and OLED display.

Components:
  - ATMEGA328P microcontroller
  - NEO-6M GPS module
  - SSD1306 OLED display
  - 3D printed enclosure
`));
        hardware.addChild(new VirtualFile('class-a-amp.txt',
`Class A Audio Amplifier
================================================================================

Simple Class A audio amplifier circuit using 2x BC337 transistors with
chemically etched PCB and SMT components.

Specifications:
  - Class A topology
  - BC337 NPN transistors
  - Custom etched PCB
  - SMT component assembly
`));
        hardware.addChild(new VirtualFile('armachat.txt',
`ArmaChat: LoRa Text Messenger
================================================================================

Standalone LoRa-based text messenger for off-grid communications with
mesh networking capabilities.

Features:
  - LoRa radio communication
  - Mesh networking protocol
  - Keyboard input
  - E-ink display
`));
        research.addChild(hardware);

        // Radio subdirectory
        const radio = new VirtualDirectory('radio');
        radio.addChild(new VirtualFile('usdx-radio.txt',
`uSDX: Open Source HF Radio
================================================================================

Credit card-sized fully operational HF radio capable of SSB and CW with
Class E amplifier design.

Specifications:
  - Multi-band HF coverage
  - SSB and CW modes
  - Class E amplifier
  - QRP output (5W)
  - Built-in ATU
`));
        radio.addChild(new VirtualFile('rtl-sdr.txt',
`RTL-SDR Projects
================================================================================

Software Defined Radio experiments with RTL-SDR dongles.

Projects:
  - ADS-B aircraft tracking
  - Weather satellite imagery (NOAA)
  - SSTV from ISS
  - Trunked radio decoding
  - Pager monitoring
`));
        radio.addChild(new VirtualFile('repeater-network.txt',
`VHF/UHF Repeater Network
================================================================================

Running linked VHF/UHF repeaters with commercial hardware.

Equipment:
  - Commercial repeaters
  - Duplexer cavities
  - Antenna systems
  - Linking equipment
`));
        research.addChild(radio);

        // Chemistry subdirectory
        const chemistry = new VirtualDirectory('chemistry');
        chemistry.addChild(new VirtualFile('electrochemistry.txt',
`Electrochemistry Projects
================================================================================

Various electrochemical synthesis and experiments.

Projects:
  - Copper sulfate synthesis (CuSO4 5H2O)
  - Ferric chloride for PCB etching
  - Sodium hydroxide electrolysis
  - Electroplating experiments
`));
        chemistry.addChild(new VirtualFile('pcb-etching.txt',
`Chemical PCB Etching
================================================================================

Home PCB fabrication using various etchants.

Etchants Used:
  - Ferric chloride (FeCl3)
  - Cupric chloride (CuCl2)
  - Sodium persulfate

Process: Photoresist -> UV exposure -> Develop -> Etch -> Drill
`));
        research.addChild(chemistry);

        user.addChild(research);

        // ====================================================================
        // /home/user/intel/ - CTF writeups and technical notes
        // ====================================================================
        const intel = new VirtualDirectory('intel');

        // CTF Writeups
        const ctfWriteups = new VirtualDirectory('ctf-writeups');
        ctfWriteups.addChild(new VirtualFile('daily-bugle.txt',
`THM - Daily Bugle
================================================================================
Platform: TryHackMe
Published: Medium (System Weakness)

Attack Chain:
  1. Joomla enumeration
  2. CVE-2017-8917 (SQLi)
  3. Hash extraction
  4. Hashcat password cracking
  5. Webshell upload
  6. yum privilege escalation

Key Techniques:
  - Joomblah for SQLi exploitation
  - JohnTheRipper/Hashcat for cracking
  - GTFOBins for yum privesc
`));
        ctfWriteups.addChild(new VirtualFile('rick-ctf.txt',
`THM - Rick CTF (Rick and Morty themed)
================================================================================
Platform: TryHackMe

Attack Chain:
  1. Web enumeration
  2. robots.txt discovery
  3. Command injection
  4. Sudo privilege escalation

Flags: 3 ingredients to find
`));
        ctfWriteups.addChild(new VirtualFile('rootme.txt',
`THM - RootMe
================================================================================
Platform: TryHackMe

Attack Chain:
  1. Directory bruteforcing
  2. File upload bypass
  3. Reverse shell
  4. SUID binary exploitation
`));
        intel.addChild(ctfWriteups);

        // Technical Notes
        const technicalNotes = new VirtualDirectory('technical-notes');
        technicalNotes.addChild(new VirtualFile('windows-privesc.txt',
`Windows Privilege Escalation Notes
================================================================================

Common Techniques:
  - SeImpersonatePrivilege (Potato attacks)
  - Unquoted Service Paths
  - AlwaysInstallElevated
  - DLL Hijacking
  - GPO Abuse
  - Weak service permissions
  - Token impersonation

Tools: winPEAS, PowerUp, Seatbelt, SharpUp
`));
        technicalNotes.addChild(new VirtualFile('linux-privesc.txt',
`Linux Privilege Escalation Notes
================================================================================

Common Techniques:
  - SUID/SGID binaries
  - Sudo misconfigurations
  - Kernel exploits
  - Capabilities abuse
  - Cron job exploitation
  - PATH hijacking
  - NFS no_root_squash

Tools: LinPEAS, Linux Exploit Suggester, pspy
`));
        technicalNotes.addChild(new VirtualFile('active-directory.txt',
`Active Directory Notes
================================================================================

Enumeration:
  - BloodHound/SharpHound
  - PowerView
  - ldapsearch
  - enum4linux-ng

Attacks:
  - Kerberoasting
  - AS-REP Roasting
  - Pass-the-Hash
  - Golden/Silver Tickets
  - DCSync
  - NTLM Relay

Tools: Impacket, Rubeus, Mimikatz, CrackMapExec
`));
        technicalNotes.addChild(new VirtualFile('web-attacks.txt',
`Web Application Attack Notes
================================================================================

OWASP Top 10:
  - SQL Injection
  - XSS (Reflected, Stored, DOM)
  - SSTI (Server-Side Template Injection)
  - LFI/RFI (File Inclusion)
  - SSRF (Server-Side Request Forgery)
  - XXE (XML External Entity)
  - Insecure Deserialization

Tools: Burp Suite, SQLMap, ffuf, Nuclei
`));
        intel.addChild(technicalNotes);

        user.addChild(intel);

        // ====================================================================
        // /home/user/about/
        // ====================================================================
        const about = new VirtualDirectory('about');
        about.addChild(new VirtualFile('profile.txt',
`=== Professional Profile ===

Name: Jeremy Laratro
Role: Cybersecurity Professional
Focus: Offensive Security, Purple Teaming, Security Research

Areas of Expertise:
  - Penetration Testing & Vulnerability Assessment
  - Red Team Operations & Attack Simulation
  - Security Tool Development
  - Cloud Security (AWS, Azure, GCP)
  - Active Directory Security

Background:
  Systems administration, network security, application security,
  and full-stack development. Strong focus on Python automation,
  infrastructure security, and cloud security.
`));
        about.addChild(new VirtualFile('certifications.txt',
`=== Certifications ===

[*] OSEP - Offensive Security Experienced Penetration Tester
    - Advanced red team operations
    - Active Directory attack techniques
    - Evasion and bypass methodologies

[*] HackTheBox Pro Labs
    - Zephyr (Completed)
    - Dante (Completed)

[*] Active Platforms
    - HackTheBox
    - TryHackMe
    - PicoCTF
    - LeetCode
`));
        about.addChild(new VirtualFile('contact.txt',
`=== Contact ===

Email: contact@jlaratro.us

Profiles:
  - GitHub: github.com/jeremylaratro
  - LinkedIn: linkedin.com/in/jeremylaratro
  - HackTheBox: app.hackthebox.com/profile/1106620
  - TryHackMe: tryhackme.com/p/jeremylaratro
`));
        user.addChild(about);

        home.addChild(user);
        root.addChild(home);

        // ====================================================================
        // /etc
        // ====================================================================
        const etc = new VirtualDirectory('etc');
        etc.addChild(new VirtualFile('passwd',
`root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
user:x:1000:1000:Portfolio User:/home/user:/bin/bash
`));
        etc.addChild(new VirtualFile('hosts',
`127.0.0.1   localhost
127.0.1.1   cyber-portfolio
::1         localhost ip6-localhost ip6-loopback
`));
        etc.addChild(new VirtualFile('motd',
`
======================================================================

              Welcome to the Portfolio Terminal
                      Jeremy Laratro
                  Cybersecurity Professional

  Type 'help' for available commands
  Type 'cat ~/readme.txt' to get started

======================================================================
`));
        root.addChild(etc);

        // /tmp
        const tmp = new VirtualDirectory('tmp');
        root.addChild(tmp);

        return root;
    }
}

export default VirtualFilesystem;
