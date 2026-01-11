# Interactive Terminal Feature - Sprint Plan

## Project Overview
Add an interactive JavaScript terminal emulator to the homepage that allows visitors to explore portfolio content using Unix-like commands.

**Branch:** `v1.05-terminal-feature`
**Target Version:** 1.5.0

---

## Architecture Reference
Based on iOScTF terminal implementation (`/home/jay/Documents/cyber/dev/iOScTF/lib/features/terminal/`):
- Command executor pattern with switch-based routing
- Immutable virtual filesystem with tree structure
- Quote-aware command parser with pipe/redirect support
- Command history management
- Result type pattern for error handling

---

## Sprint 1: Core Infrastructure
**Goal:** Build the foundational terminal components

### Task 1.1: Virtual Filesystem
**Agent:** `general-purpose`
**Files to create:** `js/terminal/filesystem.js`

**Deliverables:**
- `FSNode`, `VirtualFile`, `VirtualDirectory` classes
- Path resolution with `~`, `.`, `..` support
- Core methods: `cd()`, `ls()`, `cat()`, `pwd()`, `exists()`, `isDirectory()`
- Pre-populated filesystem structure:
  ```
  /home/user/
    /cyberops/
      cyberquizzer.txt
      purplesploit.txt
      quantsploit.txt
      mcp-kali.txt
      grepex.txt
      guacamappy.txt
      ictf.txt
      lss.txt
      ... (all projects)
    /research/
      hardware/
      radio/
      chemistry/
    /intel/
      ctf-writeups/
      technical-notes/
    /about/
      profile.txt
      certifications.txt
      experience.txt
    readme.txt
  ```

### Task 1.2: Command Parser
**Agent:** `general-purpose`
**Files to create:** `js/terminal/parser.js`

**Deliverables:**
- `parseCommandLine()` - quote-aware tokenizer
- `containsUnquotedPipe()` - pipe detection
- `containsUnquotedRedirect()` - redirect detection
- `CommandResult` class with success/error factory methods

---

## Sprint 2: Command Implementation
**Goal:** Implement core Unix commands

### Task 2.1: Navigation Commands
**Agent:** `general-purpose`
**Files to modify:** `js/terminal/commands.js`

**Commands to implement:**
| Command | Description | Example |
|---------|-------------|---------|
| `pwd` | Print working directory | `pwd` |
| `cd` | Change directory | `cd cyberops` |
| `ls` | List directory contents | `ls -la` |

**Flags to support:**
- `ls -l` - long format
- `ls -a` - show hidden files
- `ls -la` - combined

### Task 2.2: File Commands
**Agent:** `general-purpose`
**Files to modify:** `js/terminal/commands.js`

**Commands to implement:**
| Command | Description | Example |
|---------|-------------|---------|
| `cat` | Display file contents | `cat readme.txt` |
| `head` | Display first N lines | `head -n 5 file.txt` |
| `tail` | Display last N lines | `tail -n 5 file.txt` |
| `less` | Paginated file view | `less longfile.txt` |
| `file` | Detect file type | `file image.png` |

### Task 2.3: Text Processing Commands
**Agent:** `general-purpose`
**Files to modify:** `js/terminal/commands.js`

**Commands to implement:**
| Command | Description | Example |
|---------|-------------|---------|
| `grep` | Search for patterns | `grep -i python *` |
| `wc` | Word/line count | `wc -l file.txt` |
| `sort` | Sort lines | `sort file.txt` |
| `uniq` | Remove duplicates | `uniq file.txt` |

### Task 2.4: Utility Commands
**Agent:** `general-purpose`
**Files to modify:** `js/terminal/commands.js`

**Commands to implement:**
| Command | Description | Example |
|---------|-------------|---------|
| `echo` | Print text | `echo "Hello"` |
| `clear` | Clear terminal | `clear` |
| `help` | Show available commands | `help` |
| `man` | Manual pages | `man cat` |
| `history` | Command history | `history` |
| `whoami` | Current user | `whoami` |
| `date` | Current date | `date` |
| `uname` | System info | `uname -a` |

### Task 2.5: Encoding Commands (CTF-themed)
**Agent:** `general-purpose`
**Files to modify:** `js/terminal/commands.js`

**Commands to implement:**
| Command | Description | Example |
|---------|-------------|---------|
| `base64` | Encode/decode base64 | `base64 -d encoded.txt` |
| `xxd` | Hex dump | `xxd file.bin` |
| `strings` | Extract printable strings | `strings binary` |
| `md5sum` | MD5 hash | `md5sum file.txt` |
| `sha256sum` | SHA256 hash | `sha256sum file.txt` |

---

## Sprint 3: Command Executor & Pipeline
**Goal:** Wire commands together with execution engine

### Task 3.1: Command Executor
**Agent:** `general-purpose`
**Files to create:** `js/terminal/executor.js`

**Deliverables:**
- Main `execute(commandLine)` method
- Command router (switch-based dispatch)
- Alias support
- History tracking
- Pipeline execution (`cmd1 | cmd2 | cmd3`)
- Redirect support (`>`, `>>`)

### Task 3.2: Pipeline Support
**Agent:** `general-purpose`
**Files to modify:** `js/terminal/executor.js`

**Deliverables:**
- `executePipeline()` - chain commands via pipe
- `executeWithRedirect()` - output to file
- Pipe input passthrough to commands

---

## Sprint 4: Terminal UI Integration
**Goal:** Replace static homepage terminal with interactive version

### Task 4.1: Terminal UI Component
**Agent:** `general-purpose`
**Files to create:** `js/terminal/ui.js`

**Deliverables:**
- Terminal container management
- Input handling with Enter key
- Output rendering with color coding
- Auto-scroll to bottom
- Command history navigation (arrow keys)
- Focus management

### Task 4.2: Homepage Integration
**Agent:** `general-purpose`
**Files to modify:** `index.html`, `css/main.css`

**Deliverables:**
- Replace static `.terminal-body` with interactive terminal
- Add terminal input field
- Style terminal output area
- Add cursor blinking effect
- Mobile-responsive input

### Task 4.3: Terminal Styling
**Agent:** `general-purpose`
**Files to modify:** `css/effects.css`

**Deliverables:**
- Terminal color scheme (match existing theme)
- Output type colors:
  - Prompt: `--accent-green`
  - Output: `--text-primary`
  - Error: `--accent-red`
  - System: `--accent-yellow`
- Typing animation for initial display
- Scanline effect over terminal

---

## Sprint 5: Content Population
**Goal:** Create all portfolio content files

### Task 5.1: Cyberops Project Files
**Agent:** `general-purpose`
**Files to create:** Embedded in `js/terminal/content.js`

**Projects to document:**
1. CyberQuizzer
2. PurpleSploit
3. Quantsploit
4. MCP-Kali-Server Bridges
5. B-NEAS
6. WinBins
7. supwngo
8. Aradex.io
9. GrepEx
10. GuacaMappy
11. iCTF
12. Linux Security Suite
13. Cloud Pentesting Resources
14. PhotoSec
15. Discord Auto Updater
16. Securicoder

### Task 5.2: Research Project Files
**Agent:** `general-purpose`
**Content categories:**
- Hardware projects (8)
- Radio/RF projects (7)
- Chemistry projects (6)

### Task 5.3: Intel/Blog Files
**Agent:** `general-purpose`
**Content categories:**
- CTF writeups (13)
- Technical notes (13)

### Task 5.4: About/Profile Files
**Agent:** `general-purpose`
**Files:**
- `profile.txt` - Bio summary
- `certifications.txt` - Cert list
- `experience.txt` - Work history
- `skills.txt` - Skills matrix

---

## Sprint 6: Polish & Easter Eggs
**Goal:** Add finishing touches and hidden features

### Task 6.1: Easter Eggs
**Agent:** `general-purpose`

**Hidden features:**
- `sudo` - Fun denial message
- `rm -rf /` - Fake system crash animation
- `cowsay` - ASCII cow
- `matrix` - Trigger matrix rain effect
- `hack` - Fake hacking animation
- Hidden flag file for CTF visitors

### Task 6.2: Welcome Message
**Agent:** `general-purpose`

**Deliverables:**
- ASCII art banner on load
- Welcome message with hint to type `help`
- Initial animation sequence

### Task 6.3: Testing & Documentation
**Agent:** `testagent`

**Deliverables:**
- Test all commands
- Verify all file content
- Cross-browser testing
- Mobile testing
- Update README if needed

---

## File Structure (Final)

```
js/
  terminal/
    index.js          # Main entry point, exports Terminal class
    filesystem.js     # VirtualFilesystem, FSNode, VirtualFile, VirtualDirectory
    parser.js         # Command line parser, CommandResult
    executor.js       # CommandExecutor with all command handlers
    commands/
      navigation.js   # pwd, cd, ls
      files.js        # cat, head, tail, less, file
      text.js         # grep, wc, sort, uniq
      encoding.js     # base64, xxd, strings, md5sum, sha256sum
      utility.js      # echo, clear, help, man, history, whoami, date
      easter.js       # sudo, cowsay, matrix, hack
    content.js        # All portfolio content as filesystem structure
    ui.js             # Terminal UI rendering and input handling
```

---

## Execution Order

```
Sprint 1 ──→ Sprint 2 ──→ Sprint 3 ──→ Sprint 4 ──→ Sprint 5 ──→ Sprint 6
   ↓            ↓            ↓            ↓            ↓            ↓
 Core FS    Commands     Executor      UI/UX       Content      Polish
```

**Parallelization opportunities:**
- Sprint 2 tasks (2.1-2.5) can run in parallel
- Sprint 5 tasks (5.1-5.4) can run in parallel
- Sprint 6 tasks (6.1-6.3) can run in parallel

---

## Agent Assignments Summary

| Sprint | Tasks | Agent Type | Parallel |
|--------|-------|------------|----------|
| 1 | 1.1, 1.2 | general-purpose | Yes |
| 2 | 2.1-2.5 | general-purpose | Yes |
| 3 | 3.1, 3.2 | general-purpose | No (sequential) |
| 4 | 4.1-4.3 | general-purpose | Yes |
| 5 | 5.1-5.4 | general-purpose | Yes |
| 6 | 6.1-6.3 | general-purpose, testagent | Yes |

---

## Success Criteria

1. User can type commands in homepage terminal
2. Navigation: `cd`, `ls`, `pwd` work correctly
3. Files: `cat` displays project descriptions
4. Pipes: `cat file | grep pattern` works
5. History: Arrow keys navigate history
6. Mobile: Touch keyboard works
7. Styling: Matches existing cyber aesthetic
8. Performance: No lag on command execution
9. Easter eggs: At least 3 hidden features work
