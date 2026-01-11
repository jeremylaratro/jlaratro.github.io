# Version Control Log

## Versioning Schema
- **MAJOR.MINOR.PATCH** (Semantic Versioning)
- MAJOR: Breaking changes or major redesigns
- MINOR: New features, content additions
- PATCH: Bug fixes, minor updates

---

## Current Version: 1.5.0

### v1.5.0 - 2026-01-11 (branch: v1.05-terminal-feature)
**Interactive Terminal Feature**
- Full JavaScript terminal emulator for homepage hero section
- Virtual filesystem with portfolio content (14 projects, profile, certs)
- 40+ Unix-like commands across 6 categories:
  - Navigation: pwd, cd, ls
  - Files: cat, head, tail, less, file, stat
  - Text Processing: grep, wc, sort, uniq, cut, tr
  - Encoding/CTF: base64, xxd, strings, md5sum, sha256sum, rot13, rev
  - Utility: echo, clear, help, man, history, whoami, date, uname, alias, type
  - Easter Eggs: sudo, cowsay, matrix, hack, neofetch, sl, fortune, exit
- Pipe and redirect support (cmd1 | cmd2, cmd > file)
- Command history navigation (arrow keys)
- Hidden CTF flag for visitors (.flag.txt)

**Files Created:**
- `js/terminal/filesystem.js` - Virtual filesystem with immutable tree structure
- `js/terminal/parser.js` - Quote-aware command parser with pipe/redirect support
- `js/terminal/executor.js` - Command execution engine with routing
- `js/terminal/ui.js` - Terminal UI component with keyboard handling
- `js/terminal/content.js` - Portfolio content data
- `js/terminal/index.js` - Main entry point
- `js/terminal/commands/navigation.js` - pwd, cd, ls commands
- `js/terminal/commands/files.js` - File manipulation commands
- `js/terminal/commands/text.js` - Text processing commands
- `js/terminal/commands/encoding.js` - Encoding/CTF commands
- `js/terminal/commands/utility.js` - Utility commands
- `js/terminal/commands/easter.js` - Easter egg commands
- `docs/TERMINAL_SPRINT_PLAN.md` - Development planning document

**Files Modified:**
- `index.html` - Added terminal module script
- `css/main.css` - Added interactive terminal styles

---

### v1.4.0 - 2026-01-11 (commit: 178a0c8)
**Added 5 new projects to portfolio:**
- Aradex.io - Rapid software development platform (AWS S3/CloudFront)
- GrepEx - iOS regex & search dork generator (React Native/TypeScript)
- GuacaMappy - Apache Guacamole mobile client (Flutter/Dart)
- iCTF - Mobile CTF platform for iOS security training (Flutter)
- Linux Security Suite (LSS) - IDS/Antivirus monitoring dashboard (Python/Suricata)

**Files Modified:**
- `pages/cyber-projects.html` - Added 5 featured project cards
- `pages/blog.html` - Added 5 project links to Latest 2025 section

---

### v1.0.0 - 2026-01-10 (base version)
- Initial cyber-portfolio content
- Replaced site content with security-focused portfolio
- Core pages: about, contact, cyber-projects, projects, blog
- CyberQuizzer interview preparation platform
- Technical notes and CTF writeups
