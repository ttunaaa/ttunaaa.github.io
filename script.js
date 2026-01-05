const terminal = document.getElementById("terminal");
const screen = terminal.parentElement;

const PROMPT = "coen@portfolio:~$ ";
let currentInput = "";

/**
 * Append plain text to the terminal.
 */
function print(text = "") {
  terminal.textContent += text;
  // Auto-scroll to bottom like a real terminal
  screen.scrollTop = screen.scrollHeight;
}

/**
 * Print a new prompt + prepare to accept typing.
 */
function newPrompt() {
  print("\n" + PROMPT);
  currentInput = "";
}

/**
 * Clear the terminal screen.
 */
function clearScreen() {
  terminal.textContent = "";
}

/**
 * Handle a command and print output.
 */
function runCommand(raw) {
  const cmd = raw.trim();

  // Empty command: just new prompt
  if (cmd === "") return;

  // Basic commands
  if (cmd === "help") {
    print(
      "\nAvailable commands:\n" +
      "  help     - show this list\n" +
      "  whoami   - who is this\n" +
      "  ls       - list sections\n" +
      "  about    - short bio\n" +
      "  projects - where stuff will go\n" +
      "  clear    - clear screen\n"
    );
    return;
  }

  if (cmd === "whoami") {
    print("\nCoen Fink — Finance + Financial Math + CS. Building systems that compound.");
    return;
  }

  if (cmd === "ls") {
    print("\nprojects  writing  notes  about");
    return;
  }

  if (cmd === "about") {
    print(
      "\nI’m interested in decision-making, optimization, and learning by building.\n" +
      "This site is a playground + portfolio-in-progress."
    );
    return;
  }

  if (cmd === "projects") {
    print("\nOpening projects… (soon this will link out)");
    return;
  }

  if (cmd === "clear") {
    clearScreen();
    // Print prompt without the leading newline
    print(PROMPT);
    return;
  }

  // Unknown command
  print(`\ncommand not found: ${cmd}`);
}

/**
 * Redraw the current input line.
 * We do this by printing characters as they come in.
 * (Simplest approach: just append and handle backspace.)
 */
function handleKeydown(e) {
  // Don’t let the browser do its normal “find” shortcuts etc. when typing
  // (We’ll allow Ctrl/Cmd combos though.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // ENTER: run command
  if (e.key === "Enter") {
    runCommand(currentInput);
    newPrompt();
    e.preventDefault();
    return;
  }

  // BACKSPACE: delete last char visually + from buffer
  if (e.key === "Backspace") {
    if (currentInput.length > 0) {
      currentInput = currentInput.slice(0, -1);
      // Remove last character from the displayed terminal:
      terminal.textContent = terminal.textContent.slice(0, -1);
      screen.scrollTop = screen.scrollHeight;
    }
    e.preventDefault();
    return;
  }

  // Ignore keys like Shift, Arrow keys, etc.
  if (e.key.length !== 1) return;

  // Normal character
  currentInput += e.key;
  print(e.key);
  e.preventDefault();
}

/**
 * Boot message + first prompt.
 */
function boot() {
  clearScreen();
  print("Booting coenfink.com...\n");
  print("Type 'help' to begin.");
  print("\n" + PROMPT);
}

boot();
window.addEventListener("keydown", handleKeydown);
