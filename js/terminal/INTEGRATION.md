# Terminal UI Integration Guide

This guide shows how to integrate the interactive terminal into your homepage.

## Step 1: Add CSS Files

Add these stylesheets to your HTML `<head>`:

```html
<!-- Main portfolio styles (already included) -->
<link rel="stylesheet" href="css/main.css">

<!-- Terminal-specific styles -->
<link rel="stylesheet" href="css/terminal.css">
```

## Step 2: Update Homepage HTML

Replace the static terminal content in `index.html` with an interactive terminal container:

### Before (Static Terminal):
```html
<div class="terminal-body">
  <div class="prompt-line">
    <span class="prompt">guest@portfolio:~$</span>
    <span class="cmd">cat welcome.txt</span>
  </div>
  <div class="output">...</div>
</div>
```

### After (Interactive Terminal):
```html
<div class="terminal-body">
  <div class="terminal-container" id="hero-terminal"></div>
</div>
```

## Step 3: Initialize Terminal

Add this JavaScript module at the end of your HTML (before `</body>`):

```html
<script type="module">
  import { initTerminal } from './js/terminal/ui.js';

  // Initialize terminal when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const terminal = initTerminal('#hero-terminal');

    // Optional: Listen for custom events
    window.addEventListener('terminal:matrix', () => {
      // Trigger your matrix rain effect
      console.log('Matrix effect triggered!');
    });
  });
</script>
```

## Step 4: Adjust Terminal Height (Optional)

If you need to customize the terminal height, add this to your CSS:

```css
#hero-terminal {
  height: 450px; /* Adjust as needed */
}
```

## Complete Example

Here's a complete example of integrating the terminal into the hero section:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Portfolio</title>

  <!-- Styles -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/effects.css">
  <link rel="stylesheet" href="css/terminal.css">

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Matrix Background -->
  <canvas id="matrix-canvas"></canvas>

  <!-- Navigation -->
  <nav class="cyber-nav">
    <!-- Nav content -->
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="terminal-window">
        <!-- Terminal Header -->
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

        <!-- Interactive Terminal -->
        <div class="terminal-body">
          <div class="terminal-container" id="hero-terminal"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Scripts -->
  <script src="js/matrix.js"></script>
  <script src="js/main.js"></script>

  <!-- Terminal Module -->
  <script type="module">
    import { initTerminal } from './js/terminal/ui.js';

    document.addEventListener('DOMContentLoaded', () => {
      // Initialize terminal
      const terminal = initTerminal('#hero-terminal');

      // Optional: Matrix effect integration
      window.addEventListener('terminal:matrix', () => {
        // Toggle matrix rain intensity or trigger special effect
        const canvas = document.getElementById('matrix-canvas');
        if (canvas) {
          // Your matrix effect code here
        }
      });
    });
  </script>
</body>
</html>
```

## Multiple Terminals

You can create multiple terminal instances on the same page:

```javascript
// Hero terminal
const heroTerminal = initTerminal('#hero-terminal');

// Section terminal
const sectionTerminal = initTerminal('#section-terminal');
```

Each terminal maintains its own:
- Command history
- Current working directory
- Filesystem state

## Customization

### Change Welcome Message

Edit the `displayWelcome()` method in `js/terminal/ui.js`:

```javascript
displayWelcome() {
  const welcome = `Your custom welcome message here`;
  this.addOutput(welcome, 'system');
}
```

### Change Prompt

Edit the `updatePrompt()` method or modify the initial HTML in `createTerminalHTML()`:

```javascript
createTerminalHTML() {
  this.container.innerHTML = `
    <div class="terminal-output" id="terminal-output"></div>
    <div class="terminal-input-line">
      <span class="terminal-prompt">user@custom:~$</span>
      <input type="text" class="terminal-input" id="terminal-input"
             autocomplete="off" spellcheck="false" autofocus>
    </div>
  `;
}
```

### Add Custom Commands

1. Create a new command module in `js/terminal/commands/`:

```javascript
// js/terminal/commands/custom.js
import { CommandResult } from '../parser.js';

export function mycommand(args, filesystem) {
  return new CommandResult('Custom output', false);
}
```

2. Import and register in `executor.js`:

```javascript
import * as custom from './commands/custom.js';

// In _executeCommand method, add to commands object:
'mycommand': () => custom.mycommand(args, this.filesystem),
```

### Style Customization

Override CSS variables in your stylesheet:

```css
:root {
  --terminal-prompt-color: #00ff00;
  --terminal-input-color: #ffffff;
  --terminal-error-color: #ff0000;
}

.terminal-prompt {
  color: var(--terminal-prompt-color);
}

.terminal-input {
  color: var(--terminal-input-color);
}

.terminal-line.error {
  color: var(--terminal-error-color);
}
```

## Troubleshooting

### Terminal not appearing
- Check that the container element exists in the DOM
- Verify CSS files are loaded correctly
- Check browser console for errors

### Commands not working
- Verify `executor.js` is properly imported
- Check that all command modules are present in `commands/` directory
- Check browser console for import errors

### Styling issues
- Ensure `terminal.css` is loaded after `main.css`
- Check that CSS custom properties are defined
- Verify no conflicting styles

### History not working
- Ensure arrow keys are not being captured by other scripts
- Check that `executor.js` is initializing history correctly

## Performance Tips

1. **Limit output**: For large file outputs, consider pagination
2. **Clear history**: Periodically clear terminal output for long sessions
3. **Optimize animations**: Reduce animations on low-end devices

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✓ Full Support |
| Firefox | 88+     | ✓ Full Support |
| Safari  | 14+     | ✓ Full Support |
| Edge    | 90+     | ✓ Full Support |
| Mobile  | Modern  | ✓ Responsive |

## Next Steps

1. Test the terminal in your homepage
2. Add custom portfolio content to `content.js`
3. Create custom commands for your specific needs
4. Customize the welcome message and prompt
5. Style the terminal to match your exact color scheme

## Support

For issues or questions, refer to:
- `README.md` - Complete API documentation
- `example.html` - Working example
- Command implementations in `commands/` directory
