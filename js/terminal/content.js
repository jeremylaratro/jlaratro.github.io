/**
 * Initial Filesystem Content
 * Portfolio data for the terminal interface
 */

export const initialFilesystem = {
  // Home directory welcome
  '/home/user/readme.txt': `Welcome to the Portfolio Terminal v1.0

This is an interactive terminal interface for exploring my cybersecurity portfolio.

Tips:
  - Use 'ls' to list directory contents
  - Use 'cd' to navigate directories
  - Use 'cat' to read file contents
  - Use 'help' for a full command list
  - Try 'cat /home/user/.flag.txt' for a surprise

Navigate to /home/user/cyberops/ to explore my projects.
Check /home/user/about/ for professional information.

Happy exploring!
`,

  // About section
  '/home/user/about/profile.txt': `Jeremy Laratro
Cybersecurity Professional

Offensive security specialist with expertise in penetration testing, red teaming,
and security tool development. Passionate about automating security workflows and
building innovative solutions that bridge offensive and defensive capabilities.

Background: Systems administration, network security, application security, and
full-stack development. Strong focus on Python automation, infrastructure security,
and cloud security (AWS, Azure).

Current focus: Advanced exploitation techniques, Active Directory security, cloud
penetration testing, and AI-assisted security research.

Approach: Methodology-driven security assessments combined with creative problem-solving
and continuous learning. Active contributor to the security community through open-source
tool development and knowledge sharing.
`,

  '/home/user/about/certifications.txt': `Professional Certifications

[*] Offensive Security Certified Professional (OSCP)
    - Advanced penetration testing certification
    - 24-hour practical exam in isolated network
    - Manual exploitation techniques, no automated tools

[*] Offensive Security Experienced Penetration Tester (OSEP)
    - Advanced red team operations
    - Active Directory attack techniques
    - Evasion and bypass methodologies

[*] CompTIA Security+
    - Foundational cybersecurity knowledge
    - Security concepts, threats, and vulnerabilities

[*] AWS Certified Solutions Architect
    - Cloud infrastructure design
    - Security best practices in AWS

Additional Training:
- SANS SEC560: Network Penetration Testing and Ethical Hacking
- TCM Security Practical Ethical Hacking
- HackTheBox Pro Labs (Dante, RastaLabs, Offshore)
`,

  '/home/user/about/contact.txt': `Contact Information

[>] Email: contact@jlaratro.com
[>] GitHub: github.com/jlaratro
[>] LinkedIn: linkedin.com/in/jeremylaratro
[>] Twitter: @jlaratro

PGP Key: Available on request
Bug Bounty Programs: HackerOne, Bugcrowd

Response Time: Usually within 24-48 hours

Open to:
- Consulting opportunities
- Security research collaboration
- Speaking engagements
- Open source contributions
`,

  // Hidden CTF flag
  '/home/user/.flag.txt': `Congratulations! You found the hidden flag.

FLAG{w3lc0m3_t0_th3_t3rm1n4l_h4ck3r}

You've demonstrated curiosity and basic enumeration skills - key traits
for any security professional. Keep exploring!
`,

  // Project files
  '/home/user/cyberops/cyberquizzer.txt': `CyberQuizzer - Interactive Security Interview Prep Platform
================================================================================

An interactive interview preparation platform designed for cybersecurity
professionals, featuring 135+ real-world challenges across multiple domains.

Categories:
  - Penetration Testing (OSCP-style challenges)
  - Blue Team Operations (incident response, threat hunting)
  - Hardware Security (embedded systems, IoT)
  - Network Security
  - Web Application Security
  - Cryptography

Features:
  - Progressive difficulty levels (beginner to advanced)
  - Detailed explanations and learning resources
  - Score tracking and progress analytics
  - Mobile-responsive design
  - No account required - privacy-focused

Tech Stack: React, TypeScript, Tailwind CSS, Firebase
Status: Live and actively maintained
URL: https://cyberquizzer.com
`,

  '/home/user/cyberops/purplesploit.txt': `PurpleSploit - Penetration Testing Framework
================================================================================

Comprehensive Python-based pentesting framework combining offensive tools with
organized vulnerability management and credential tracking.

Core Features:
  - Dual interface: CLI for automation, Web UI for visualization
  - SQLite database for credential/hash management
  - Nmap XML parsing and service enumeration
  - Ligolo-ng integration for pivoting and tunneling
  - Automated exploit module system
  - Custom payload generation and obfuscation

Modules:
  - Reconnaissance (subdomain enum, port scanning, DNS)
  - Exploitation (SMB, RDP, SSH, web vulns)
  - Post-exploitation (credential harvesting, persistence)
  - Reporting (automated markdown/HTML reports)

Tech Stack: Python 3.11, Flask, SQLAlchemy, Click
Status: Active development
GitHub: github.com/jlaratro/purplesploit
`,

  '/home/user/cyberops/quantsploit.txt': `QuantSploit - Quantitative Trading Framework
================================================================================

Terminal-based quantitative trading framework with real-time market analysis
and technical indicator calculations for algorithmic trading strategies.

Technical Indicators:
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - SMA/EMA (Simple/Exponential Moving Averages)
  - Bollinger Bands
  - Stochastic Oscillator

Options Analytics:
  - Greeks calculation (Delta, Gamma, Theta, Vega, Rho)
  - Implied volatility modeling
  - Black-Scholes pricing
  - Risk/reward analysis

Features:
  - Rich TUI interface with real-time charts
  - Backtesting engine with historical data
  - Custom strategy builder
  - Multi-exchange support (Alpaca, TD Ameritrade)

Tech Stack: Python, Rich/Textual, NumPy, Pandas
Status: Personal use, selective sharing
`,

  '/home/user/cyberops/mcp-kali.txt': `MCP-Kali - AI-Assisted Penetration Testing Bridge
================================================================================

Model Context Protocol (MCP) server that bridges Kali Linux tools with AI models,
enabling AI-assisted penetration testing workflows.

Supported AI Models:
  - OpenAI GPT-4 / GPT-4 Turbo
  - Anthropic Claude 3 (Opus, Sonnet, Haiku)
  - Google Gemini Pro

Capabilities:
  - Natural language tool invocation ("scan this subnet")
  - Intelligent command suggestions based on context
  - Automated vulnerability analysis and exploitation
  - Report generation with AI-powered insights
  - Chain complex attack sequences through conversation

Security Features:
  - Sandboxed execution environment
  - Command whitelisting and validation
  - Audit logging for all AI-assisted actions
  - No credential exposure to AI models

Tech Stack: Python, MCP SDK, Docker
Status: Experimental / Research project
GitHub: github.com/jlaratro/mcp-kali
`,

  '/home/user/cyberops/b-neas.txt': `B-NEAS - Bash Network Enumeration Automation Script
================================================================================

OSCP-focused automation script for efficient network enumeration and initial
reconnaissance during penetration testing engagements.

Automation Modules:
  - Port scanning (nmap with optimized flags)
  - Service enumeration (version detection, default credentials)
  - Web directory bruteforcing (gobuster, feroxbuster)
  - SMB enumeration (shares, users, null sessions)
  - DNS zone transfers and subdomain discovery
  - SNMP enumeration and community string bruteforce

OSCP-Specific Features:
  - Organized output directory structure
  - Automatic note generation for screenshots
  - Quick wins detection (EternalBlue, MS17-010, etc.)
  - Minimal noise for exam environments

Output:
  - Structured markdown notes
  - Copy-paste ready exploitation commands
  - Evidence collection for reporting

Tech Stack: Bash, standard Kali tools
Status: Stable, exam-tested
GitHub: github.com/jlaratro/b-neas
`,

  '/home/user/cyberops/winbins.txt': `WinBins - Windows Pentesting Binary Updater
================================================================================

Automated utility for maintaining an up-to-date collection of Windows pentesting
binaries and tools for red team operations.

Managed Tools:
  - Privilege escalation (winPEAS, PowerUp, Seatbelt)
  - Credential dumping (Mimikatz, LaZagne, SharpDPAPI)
  - Network tools (Chisel, ligolo-ng, plink)
  - Execution (Rubeus, Certify, SharpHound)
  - AV evasion (Invoke-Obfuscation, Donut, ScareCrow)

Features:
  - Automatic version checking against GitHub releases
  - Binary integrity verification (hash checking)
  - Organized directory structure by category
  - Quick deployment to target systems
  - Metadata tracking (version, last update, CVEs addressed)

Workflow Integration:
  - Pre-engagement preparation automation
  - SMB share staging for internal pentests
  - USB rubber ducky payload preparation

Tech Stack: Python, Requests, GitHub API
Status: Stable, actively maintained
`,

  '/home/user/cyberops/supwngo.txt': `SupwnGo - Automated Penetration Testing Utility
================================================================================

Automated penetration testing utility designed for rapid vulnerability assessment
and exploitation with built-in autopwn capabilities.

Core Functionality:
  - Multi-threaded target discovery and enumeration
  - Vulnerability matching against exploit database
  - Automated exploitation with callback verification
  - Credential reuse and password spraying
  - Post-exploitation automation (loot collection)

Autopwn Modules:
  - Common CVEs (EternalBlue, BlueKeep, PrintNightmare)
  - Default credentials across 500+ services
  - Web application vulnerabilities (SQLi, RCE, LFI)
  - Misconfigurations (weak permissions, unquoted paths)

Safety Features:
  - Dry-run mode for testing
  - Rate limiting to avoid detection
  - Automatic backup before exploitation
  - Detailed logging for post-engagement review

Tech Stack: Go, concurrent execution patterns
Status: Internal tool, not publicly released
`,

  '/home/user/cyberops/aradex.txt': `Aradex - Rapid Software Development Platform
================================================================================

Cloud-native rapid application development platform focused on accelerated
deployment pipelines and infrastructure automation.

Architecture:
  - Frontend: React with TypeScript, hosted on AWS S3
  - CDN: CloudFront distribution with edge caching
  - Backend: Serverless (AWS Lambda, API Gateway)
  - Database: DynamoDB for NoSQL, RDS for relational
  - CI/CD: GitHub Actions with automated testing

Key Features:
  - Component library with 50+ pre-built UI elements
  - Drag-and-drop interface builder
  - Real-time collaboration (multiplayer editing)
  - Version control integration
  - One-click deployment to multiple environments

Performance:
  - Global CDN latency <50ms
  - 99.9% uptime SLA
  - Auto-scaling based on traffic
  - Cost optimization through serverless architecture

Tech Stack: React, TypeScript, AWS (S3, CloudFront, Lambda), Terraform
Status: Production, private beta
`,

  '/home/user/cyberops/grepex.txt': `GrepEx - Regex & Search Dork Generator for iOS
================================================================================

Powerful iOS application for generating regular expressions and search dorks
with extensive template library and multi-language export capabilities.

Regex Features:
  - 80+ pre-built regex templates
  - Interactive pattern tester with live validation
  - Common patterns (email, IP, URL, phone, credit cards)
  - Custom pattern builder with visual editor
  - Export to 21+ programming languages

Search Dork Integration:
  - Google Hacking Database (GHDB) with 3,600+ dorks
  - Category filtering (files, vulnerabilities, sensitive data)
  - Custom dork creation and sharing
  - Direct search integration (Google, Shodan, Censys)
  - Favorites and history tracking

Export Languages:
  Python, JavaScript, Java, C#, PHP, Ruby, Go, Rust, Swift, Kotlin,
  Perl, R, Scala, Haskell, Lua, and more

Tech Stack: Swift, SwiftUI, CoreData
Status: App Store release planned Q2 2026
`,

  '/home/user/cyberops/guacamappy.txt': `GuacamAPPy - Apache Guacamole Mobile Client
================================================================================

Feature-rich mobile client for Apache Guacamole remote desktop gateway,
supporting multiple protocols and seamless connectivity.

Supported Protocols:
  - RDP (Remote Desktop Protocol)
  - VNC (Virtual Network Computing)
  - SSH (Secure Shell)
  - Telnet

Features:
  - Multi-session management (switch between connections)
  - Credential vault with biometric authentication
  - Custom keyboard with function keys and shortcuts
  - Gesture controls (pinch-to-zoom, swipe navigation)
  - Session recording and playback
  - File transfer (SFTP integration)

Security:
  - End-to-end encryption
  - Certificate pinning
  - No credential storage on device (optional)
  - Session timeout and auto-lock

Tech Stack: Flutter, Dart, Apache Guacamole API
Status: Beta testing, iOS and Android
GitHub: github.com/jlaratro/guacamappy
`,

  '/home/user/cyberops/ictf.txt': `iCTF - Mobile Capture The Flag Platform
================================================================================

iOS-native CTF (Capture The Flag) platform featuring sandboxed security
challenges and an integrated terminal emulator for on-the-go learning.

Challenge Categories:
  - Web exploitation
  - Cryptography
  - Reverse engineering (ARM/x86)
  - Binary exploitation
  - Forensics
  - OSINT (Open Source Intelligence)

Platform Features:
  - Built-in terminal emulator with Python/Bash support
  - Sandboxed challenge environment (no jailbreak required)
  - Progress tracking and leaderboards
  - Hints system with point penalties
  - Write-up submission and sharing
  - Offline mode for challenges without network

Educational Focus:
  - Beginner-friendly tutorials
  - Progressive difficulty curve
  - Detailed explanations for each solution
  - Mobile-optimized interface

Tech Stack: Swift, SwiftUI, LibTerm (terminal), Themis (crypto)
Status: Private beta, App Store submission pending
`,

  '/home/user/cyberops/lss.txt': `LSS - Linux Security Suite
================================================================================

Comprehensive Linux security monitoring suite combining intrusion detection,
malware scanning, and threat intelligence integration.

Core Components:
  - Suricata IDS/IPS (intrusion detection/prevention)
  - ClamAV antivirus with real-time scanning
  - Custom log aggregation and analysis
  - OSSEC host-based intrusion detection

Threat Intelligence Integration:
  - VirusTotal API (file/URL reputation)
  - AlienVault OTX (Open Threat Exchange)
  - ThreatFox (IOC database from abuse.ch)
  - AbuseIPDB (IP reputation and reporting)

Monitoring Capabilities:
  - Real-time file integrity monitoring (FIM)
  - Network traffic analysis and alerting
  - Log correlation across multiple sources
  - Automated incident response workflows
  - Email/Slack/Discord alert notifications

Dashboard:
  - Web-based interface for alert management
  - Threat visualization and trending
  - Custom rule creation and tuning

Tech Stack: Python, Suricata, ClamAV, SQLite, Flask
Status: Stable, personal infrastructure deployment
`,

  '/home/user/cyberops/photosec.txt': `PhotoSec - Photo Metadata & Privacy Tool
================================================================================

Privacy-focused utility for analyzing and removing sensitive metadata from
photos to prevent information leakage and protect user privacy.

Metadata Analysis:
  - EXIF data extraction (camera, settings, timestamps)
  - GPS coordinates and location mapping
  - Software/device identification
  - Copyright and ownership information
  - Hidden metadata and steganography detection

Privacy Features:
  - One-click metadata stripping
  - Batch processing for multiple files
  - Selective metadata removal (keep timestamps, remove GPS)
  - Secure deletion with overwrite
  - Before/after comparison view

Security Applications:
  - OSINT reconnaissance (analyze target photos)
  - OpSec for red team operations
  - Digital forensics (metadata timeline analysis)
  - Privacy auditing for personal photos

Supported Formats:
  JPEG, PNG, TIFF, HEIC, RAW (CR2, NEF, ARW), WebP, GIF

Tech Stack: Python, Pillow, ExifTool, PyQt6
Status: Stable, open source
GitHub: github.com/jlaratro/photosec
`,

  '/home/user/cyberops/securicoder.txt': `SecuriCoder - AI Code Security Analysis Platform
================================================================================

AI-powered code security analysis platform leveraging large language models
to identify vulnerabilities and provide actionable remediation guidance.

Analysis Capabilities:
  - Static code analysis with vulnerability detection
  - OWASP Top 10 coverage (injection, XSS, broken auth, etc.)
  - Supply chain security (dependency analysis)
  - Secret detection (API keys, passwords, tokens)
  - Code quality and best practices review

AI Integration:
  - OpenAI GPT-4 for natural language explanations
  - Custom fine-tuned models for specific languages
  - Context-aware remediation suggestions
  - False positive reduction through ML

Supported Languages:
  Python, JavaScript, TypeScript, Java, C#, Go, PHP, Ruby, Rust

Features:
  - GitHub/GitLab integration (PR comments)
  - CI/CD pipeline integration
  - Historical vulnerability tracking
  - Developer training recommendations
  - Compliance reporting (PCI-DSS, HIPAA, SOC2)

Tech Stack: Django, Python, OpenAI API, Celery, PostgreSQL
Status: Production, SaaS offering
URL: https://securicoder.io
`,

  // System files
  '/etc/passwd': `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
user:x:1000:1000:Portfolio User:/home/user:/bin/bash
sshd:x:110:65534::/run/sshd:/usr/sbin/nologin
`,

  '/etc/hosts': `127.0.0.1       localhost
127.0.1.1       portfolio-terminal
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters

# Portfolio infrastructure
192.168.1.10    dev.jlaratro.local
192.168.1.11    staging.jlaratro.local
192.168.1.12    prod.jlaratro.local

# Lab environment
10.10.10.1      kali.lab.local
10.10.10.2      windows-dc.lab.local
10.10.10.3      ubuntu-server.lab.local
`,

  '/etc/motd': `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              Welcome to the Portfolio Terminal               ║
║                      Jeremy Laratro                          ║
║                  Cybersecurity Professional                  ║
║                                                              ║
║  Type 'help' for available commands                          ║
║  Type 'cat /home/user/readme.txt' to get started            ║
║                                                              ║
║  Last login: 2026-01-11                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`,
};
