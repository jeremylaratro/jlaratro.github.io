/**
 * Easter Egg Commands for Portfolio Terminal
 * Fun hidden commands for users to discover
 */

import { CommandResult } from '../parser.js';

/**
 * sudo - Fake sudo with permission denial
 * @param {string[]} args - Command arguments
 * @returns {CommandResult}
 */
export function sudo(args) {
    const denials = [
        "Nice try! This terminal doesn't have root access.",
        "Permission denied: Guest users cannot sudo.",
        "[sudo] password for guest: \nSorry, try again.\n[sudo] password for guest: \nSorry, try again.\n[sudo] password for guest: \nsudo: 3 incorrect password attempts",
        "sudo: you must be sudoer to use sudo. This incident will be reported.",
        "We trust you have received the usual lecture from the local System\nAdministrator. It usually boils down to these three things:\n\n    #1) Respect the privacy of others.\n    #2) Think before you type.\n    #3) With great power comes great responsibility.\n\n[sudo] password for guest: \nPermission denied."
    ];

    return CommandResult.success(denials[Math.floor(Math.random() * denials.length)]);
}

/**
 * rm - Safe remove with easter eggs for dangerous commands
 * @param {string[]} args - Command arguments
 * @param {VirtualFilesystem} filesystem - Filesystem instance
 * @returns {CommandResult}
 */
export function rm(args, filesystem) {
    if (args.length === 0) {
        return CommandResult.error('rm: missing operand');
    }

    // Check for dangerous rm -rf / patterns
    const cmdLine = args.join(' ');
    if (cmdLine.match(/(-rf?|--recursive)\s+(\/|\*|~)/i) ||
        cmdLine.match(/\/(\/|\*)\s+(-rf?|--recursive)/i)) {

        const explosion = `
    CRITICAL ERROR: System deletion initiated!

         ,-^^-,
        /  ##  \\
       |  ####  |
       |  ####  |    BOOM!
        \\  ##  /
         '-vv-'

    [====================================]

    Deleting: /dev/null
    Deleting: /dev/zero
    Deleting: /etc/shadow
    Deleting: /boot/vmlinuz
    Deleting: Everything important...

    Just kidding! This is a sandboxed portfolio terminal.
    Nothing was actually deleted. Nice try though!

    Pro tip: Never run 'rm -rf /' on a real system.
        `;

        return CommandResult.success(explosion);
    }

    // Handle normal rm operations (safe removal)
    const flags = args.filter(arg => arg.startsWith('-'));
    const files = args.filter(arg => !arg.startsWith('-'));

    if (files.length === 0) {
        return CommandResult.error('rm: missing operand');
    }

    // Attempt to remove files
    try {
        for (const file of files) {
            filesystem.rm(file);
        }
        return CommandResult.success('');
    } catch (error) {
        return CommandResult.error(error.message);
    }
}

/**
 * cowsay - ASCII cow with speech bubble
 * @param {string[]} args - Command arguments (message)
 * @returns {CommandResult}
 */
export function cowsay(args) {
    const message = args.length > 0 ? args.join(' ') : "Moo!";
    const msgLength = message.length;
    const border = '-'.repeat(msgLength + 2);

    const cow = `
 ${border}
< ${message} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
    `;

    return CommandResult.success(cow);
}

/**
 * matrix - Trigger matrix rain effect
 * @returns {CommandResult}
 */
export function matrix() {
    // Return a special marker that the UI can interpret to trigger matrix effect
    const result = CommandResult.success('\n[MATRIX MODE ACTIVATED]\n\nThe Matrix has you...\nFollow the white rabbit.\n\nPress any key to continue...\n');
    result.specialEffect = 'matrix';
    return result;
}

/**
 * cmatrix - Alias for matrix
 * @returns {CommandResult}
 */
export function cmatrix() {
    return matrix();
}

/**
 * hack - Fake Hollywood-style hacking sequence
 * @param {string[]} args - Target (optional)
 * @returns {CommandResult}
 */
export function hack(args) {
    const target = args.length > 0 ? args[0] : "mainframe";

    const sequence = `
[*] Initializing hack sequence...
[*] Target: ${target}
[*] Loading exploit modules...

[+] Bypassing firewall...................[OK]
[+] Cracking encryption..................[OK]
[+] Injecting payload....................[OK]
[+] Establishing backdoor................[OK]
[+] Covering tracks......................[OK]

[!] ACCESS GRANTED

    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗
    ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
    ███████║███████║██║     █████╔╝ █████╗  ██║  ██║
    ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
    ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██████╔╝
    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝

[*] System compromised. You're in.
[*] Remember: With great power comes great responsibility.
    `;

    return CommandResult.success(sequence);
}

/**
 * neofetch - Display system info (portfolio-themed)
 * @returns {CommandResult}
 */
export function neofetch() {
    const info = `
       ___           jeremy@portfolio
      /   \\          -----------------
     |  o  |         OS: PortfolioOS v1.0
     |  _  |         Shell: cyber-term 2.0
      \\_|_/          Theme: Matrix Hacker
       | |           Terminal: Web-based
      /   \\          CPU: Your Browser
     |     |         Memory: Unlimited
     |_____|         Uptime: Since page load

    System Type: Static Portfolio
    Environment: Cybersecurity Showcase
    Purpose: Demonstrate skills & projects
    Security: Sandboxed JavaScript

    Packages: cat, ls, cd, grep, curl, ssh
    Hidden: Try 'help easter' for surprises
    `;

    return CommandResult.success(info);
}

/**
 * sl - Steam locomotive (for typo of ls)
 * @returns {CommandResult}
 */
export function sl() {
    const train = `

      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  |  ______|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|____
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__
 |/-=|___|=O=====O=====O=====O   |_____/~\\___/
  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/

  Oops! Did you mean 'ls'?
    `;

    return CommandResult.success(train);
}

/**
 * fortune - Random cybersecurity/hacker quotes
 * @returns {CommandResult}
 */
export function fortune() {
    const fortunes = [
        "\"The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards.\" - Gene Spafford",
        "\"Hackers are breaking the systems for profit. Before, it was about intellectual curiosity and pursuit of knowledge and thrill, and now hacking is big business.\" - Kevin Mitnick",
        "\"The best way to predict the future is to invent it.\" - Alan Kay",
        "\"In God we trust. All others must bring data.\" - W. Edwards Deming",
        "\"Security is not a product, but a process.\" - Bruce Schneier",
        "\"There are two types of encryption: one that will prevent your sister from reading your diary and one that will prevent your government.\" - Bruce Schneier",
        "\"A good programmer is someone who always looks both ways before crossing a one-way street.\" - Doug Linder",
        "\"It's not a bug, it's an undocumented feature.\" - Anonymous",
        "\"The quieter you become, the more you are able to hear.\" - Kali Linux motto",
        "\"Always code as if the person who ends up maintaining your code is a violent psychopath who knows where you live.\" - John Woods",
        "\"There is no patch for human stupidity.\" - Anonymous",
        "\"If you think technology can solve your security problems, then you don't understand the problems and you don't understand the technology.\" - Bruce Schneier",
        "\"The Internet is not a truck. It's a series of tubes.\" - Ted Stevens (just kidding!)",
        "\"To err is human, but to really foul things up you need a computer.\" - Paul R. Ehrlich",
        "\"Some people have a way with words, and other people...oh, not have way.\" - Steve Martin (Wait, wrong quote)"
    ];

    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    return CommandResult.success(`\n${fortune}\n`);
}

/**
 * exit - Fun message about not being able to leave
 * @returns {CommandResult}
 */
export function exit() {
    const messages = [
        "You can check out any time you like, but you can never leave...\n\n(This is a web terminal - just close the tab if you want to leave!)",
        "Exit? There is no exit in the Matrix.\n\nTry 'clear' to reset the terminal instead.",
        "Exiting would be too easy. Try exploring more commands!\n\nHint: Type 'help' for available commands.",
        "404: Exit not found.\n\nThis terminal doesn't have an exit. But feel free to explore!",
        "You've been trapped in the cyber realm!\n\nJust kidding - you can close this tab anytime. Or type 'contact' to escape to my email."
    ];

    return CommandResult.success(messages[Math.floor(Math.random() * messages.length)]);
}

/**
 * quit - Alias for exit
 * @returns {CommandResult}
 */
export function quit() {
    return exit();
}

/**
 * logout - Alias for exit
 * @returns {CommandResult}
 */
export function logout() {
    return exit();
}
