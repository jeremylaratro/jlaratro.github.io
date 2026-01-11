# Interactive Terminal UI

A fully functional terminal emulator UI component for the cyber-portfolio website. Provides a Unix-like shell experience with a virtual filesystem, command execution, pipes, redirects, and history.

## Features

- **Full Command Execution**: Execute Unix-like commands with arguments
- **Virtual Filesystem**: Navigate directories and read files
- **Command History**: Navigate through previous commands with ↑/↓ arrow keys
- **Keyboard Shortcuts**: Ctrl+C, Ctrl+L, Tab completion (placeholder)
- **Styled Output**: Color-coded output for errors, system messages, and info
- **Responsive Design**: Works on desktop and mobile devices
- **Matrix Effect Integration**: Special commands trigger custom events

## Files

- `ui.js` - Main Terminal UI component
- `executor.js` - Command execution engine with pipeline and redirect support
- `parser.js` - Command-line parsing (quotes, pipes, redirects)
- `filesystem.js` - Virtual filesystem implementation
- `content.js` - Portfolio content as virtual files
- `commands/` - Command implementations organized by category

## Quick Start

### 1. Include Required CSS

```html
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/terminal.css">
```

### 2. Add Terminal Container

```html
<div class="terminal-window">
  <div class="terminal-header">
    <div class="terminal-controls">
      <span class="terminal-btn close"></span>
      <span class="terminal-btn min"></span>
      <span class="terminal-btn max"></span>
    </div>
    <div class="terminal-title">guest@portfolio.sh</div>
    <div class="terminal-status">
      <span class="status-dot"></span>
      <span>ONLINE</span>
    </div>
  </div>
  <div class="terminal-container" id="interactive-terminal"></div>
</div>
```

### 3. Initialize Terminal

```javascript
import { initTerminal } from './js/terminal/ui.js';

// Initialize terminal
const terminal = initTerminal('#interactive-terminal');

// Optional: Listen for custom events
window.addEventListener('terminal:matrix', () => {
  // Trigger matrix animation
});
```

## Terminal Class API

### Constructor

```javascript
new Terminal(containerSelector)
```

Creates a new terminal instance.

**Parameters:**
- `containerSelector` (string): CSS selector for the terminal container

**Throws:**
- Error if container element not found

### Methods

#### `init()`
Initialize the terminal (automatically called by constructor).

#### `executeCommand(input)`
Execute a command and display results.

**Parameters:**
- `input` (string): Command string to execute

#### `addOutput(text, type, showPrompt)`
Add output to the terminal display.

**Parameters:**
- `text` (string): Text to display
- `type` (string): Output type - 'prompt', 'output', 'error', 'system', 'info'
- `showPrompt` (boolean): Whether to show prompt before text

#### `navigateHistory(direction)`
Navigate through command history.

**Parameters:**
- `direction` (string): 'up' or 'down'

#### `focus()`
Focus the terminal input field.

#### `clear()`
Clear the terminal output.

#### `getCwd()`
Get current working directory.

**Returns:** (string) Current working directory path

#### `getHistory()`
Get command history.

**Returns:** (Array) Array of command strings

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Execute command |
| ↑ | Previous command in history |
| ↓ | Next command in history |
| Tab | Command completion (TODO) |
| Ctrl+C | Cancel current input |
| Ctrl+L | Clear screen |

## Available Commands

### Navigation
- `pwd` - Print working directory
- `cd [dir]` - Change directory
- `ls [options] [path]` - List directory contents
  - Options: `-l` (long format), `-a` (show hidden), `-h` (human readable)

### File Operations
- `cat <file>` - Display file contents
- `head [-n lines] <file>` - Display first lines of file
- `tail [-n lines] <file>` - Display last lines of file
- `less <file>` - View file with paging
- `file <file>` - Determine file type
- `stat <file>` - Display file statistics

### Text Processing
- `grep [options] <pattern> [file]` - Search for patterns
  - Options: `-i` (case insensitive), `-n` (line numbers), `-v` (invert), `-c` (count)
- `wc [options] [file]` - Count lines, words, characters
  - Options: `-l` (lines), `-w` (words), `-c` (chars)
- `sort [options] [file]` - Sort lines
  - Options: `-r` (reverse), `-n` (numeric), `-u` (unique)
- `uniq [file]` - Remove duplicate lines
- `cut -f<fields> [file]` - Cut out fields
- `tr <set1> <set2>` - Translate characters

### Encoding
- `base64 [options] [file]` - Base64 encode/decode
  - Options: `-d` (decode)
- `xxd [file]` - Hex dump
- `strings [file]` - Extract printable strings
- `md5sum [file]` - Calculate MD5 hash
- `sha256sum [file]` - Calculate SHA-256 hash
- `rot13 [text]` - ROT13 cipher
- `rev [file]` - Reverse lines

### Utility
- `echo [text]` - Display text
- `clear` / `cls` - Clear screen
- `help [command]` - Display help
- `man <command>` - Display manual page
- `history` - Display command history
- `whoami` - Display current user
- `date` - Display current date/time
- `uname [options]` - Display system information
- `alias [name=value]` - Create command alias
- `type <command>` - Display command type

### Easter Eggs
- `sudo [command]` - Attempt superuser access
- `rm [options] [file]` - Remove files (safe mode)
- `cowsay <message>` - ASCII cow says message
- `matrix` - Trigger Matrix effect
- `hack [target]` - Hacking simulator
- `neofetch` - System information display
- `sl` - Steam locomotive animation
- `fortune` - Random fortune
- `exit` - Exit terminal (displays message)

## Pipes and Redirects

### Pipes
Chain commands together:
```bash
cat README.md | grep "terminal" | wc -l
ls -l | sort -r
```

### Output Redirection
Redirect output to files:
```bash
echo "Hello World" > output.txt    # Overwrite
echo "Another line" >> output.txt  # Append
ls -la > listing.txt
```

## Customization

### CSS Variables
The terminal uses CSS variables from `main.css`:

```css
--accent-green-bright  /* Prompt color */
--text-primary         /* Input text color */
--text-secondary       /* Output text color */
--accent-red-bright    /* Error messages */
--accent-yellow        /* System messages */
--accent-blue-light    /* Info messages */
--border-color         /* Terminal borders */
```

### Custom Commands
Add commands by modifying `executor.js`:

```javascript
// Add to commands object in _executeCommand method
'mycommand': () => mymodule.mycommand(args, this.filesystem),
```

Create command module in `commands/` directory:

```javascript
export function mycommand(args, filesystem) {
  return new CommandResult('Output text', false);
}
```

## Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/terminal.css">
</head>
<body>
    <div class="terminal-window">
        <div class="terminal-header">...</div>
        <div class="terminal-container" id="terminal"></div>
    </div>

    <script type="module">
        import { initTerminal } from './js/terminal/ui.js';
        const terminal = initTerminal('#terminal');
    </script>
</body>
</html>
```

## Browser Compatibility

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Full support with responsive design

## Performance

- Lazy command execution
- Efficient DOM manipulation
- History capped at 1000 commands
- Scrolling optimized with scroll-behavior: smooth

## Security

- No actual filesystem access
- Command execution sandboxed to virtual environment
- No network requests from terminal
- Safe HTML escaping for output

## License

Part of the jlaratro.github.io portfolio website.
