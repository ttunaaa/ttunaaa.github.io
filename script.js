const terminal = document.getElementById("terminal");
const screen = terminal.parentElement;

const PROMPT = "coen@portfolio:~$ ";
let currentInput = "";
let acceptingInput = false;

// ---------- helpers ----------
function scrollToBottom() {
  screen.scrollTop = screen.scrollHeight;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearScreen() {
  terminal.innerHTML = "";
  scrollToBottom();
}

function addLine() {
  const line = document.createElement("div");
  terminal.appendChild(line);
  return line;
}

function appendText(el, text) {
  el.appendChild(document.createTextNode(text));
  scrollToBottom();
}

async function typeText(el, text, speed = 25) {
  for (const ch of text) {
    el.appendChild(document.createTextNode(ch));
    scrollToBottom();
    await sleep(speed);
  }
}

// ---------- input line (prompt + input + cursor) ----------
let inputLineEl = null;
let promptEl = null;
let inputEl = null;
let cursorEl = null;

function renderPromptLine() {
  inputLineEl = addLine();

  promptEl = document.createElement("span");
  promptEl.className = "prompt";
  promptEl.textContent = PROMPT;

  inputEl = document.createElement("span");
  inputEl.className = "input";
  inputEl.textContent = "";

  cursorEl = document.createElement("span");
  cursorEl.className = "cursor";
  cursorEl.textContent = "█";

  inputLineEl.appendChild(promptEl);
  inputLineEl.appendChild(inputEl);
  inputLineEl.appendChild(cursorEl);

  currentInput = "";
  acceptingInput = true;
  scrollToBottom();
}

function setInputText(text) {
  currentInput = text;
  inputEl.textContent = currentInput;
  scrollToBottom();
}

// Print output on a new line (keeps prompt line separate)
function printLine(text = "") {
  const line = addLine();
  appendText(line, text);
  return line;
}

// Print output that includes links
function printLsLinks() {
  const line = addLine();
  // Example output: projects  writing  notes  about (as links)
  const items = [
    { label: "projects", href: "projects.html" },
    { label: "writing", href: "writing.html" },
    { label: "notes", href: "notes.html" },
    { label: "about", href: "about.html" },
  ];

  items.forEach((item, i) => {
    const a = document.createElement("a");
    a.className = "term-link";
    a.href = item.href;
    a.textContent = item.label;
    line.appendChild(a);

    if (i !== items.length - 1) {
      line.appendChild(document.createTextNode("  "));
    }
  });

  scrollToBottom();
}

// After user presses Enter, we “finalize” the prompt line
function finalizePromptLine() {
  // Remove the cursor from the old line so it looks like the command is finished
  if (cursorEl && cursorEl.parentElement) cursorEl.remove();
  acceptingInput = false;
}

// ---------- commands ----------
function runCommand(raw) {
  const cmd = raw.trim();

  if (cmd === "") return;

  if (cmd === "help") {
    printLine("Available commands:");
    printLine("  help     - show this list");
    printLine("  whoami   - who is this");
    printLine("  ls       - list sections (clickable)");
    printLine("  open X   - open a page (projects/writing/notes/about)");
    printLine("  clear    - clear screen");
    return;
  }

  if (cmd === "whoami") {
    printLine("Coen Fink — Finance + Financial Math + CS.");
    printLine("Interested in decision-making, optimization, and building things that compound.");
    return;
  }

  if (cmd === "ls") {
    printLsLinks();
    return;
  }

  if (cmd.startsWith("open ")) {
    const target = cmd.slice(5).trim();
    const map = {
      projects: "projects.html",
      writing: "writing.html",
      notes: "notes.html",
      about: "about.html",
    };
    if (map[target]) {
      printLine(`Opening ${target}...`);
      // Actually navigate:
      window.location.href = map[target];
    } else {
      printLine(`Unknown page: ${target}`);
    }
    return;
  }

  if (cmd === "clear") {
    clearScreen();
    // After clearing, immediately show a fresh prompt
    renderPromptLine();
    return;
  }

  printLine(`command not found: ${cmd}`);
}

// ---------- keyboard handling ----------
function handleKeydown(e) {
  if (!acceptingInput) return;

  // Allow browser shortcuts (Ctrl/Cmd etc.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === "Enter") {
    finalizePromptLine();
    runCommand(currentInput);
    // New prompt after command runs (unless command navigated away)
    renderPromptLine();
    e.preventDefault();
    return;
  }

  if (e.key === "Backspace") {
    if (currentInput.length > 0) {
      setInputText(currentInput.slice(0, -1));
    }
    e.preventDefault();
    return;
  }

  // Ignore arrows, shift, etc.
  if (e.key.length !== 1) return;

  // Add typed character
  setInputText(currentInput + e.key);
  e.preventDefault();
}

// ---------- boot sequence (typewriter) ----------
async function boot() {
  clearScreen();

  const l1 = addLine();
  await typeText(l1, "Booting coenfink.com...", 22);

  const l2 = addLine();
  await typeText(l2, "Loading terminal environment...", 18);

  const l3 = addLine();
  await typeText(l3, "Type 'help' to begin.", 18);

  addLine(); // blank line

  renderPromptLine();
  window.addEventListener("keydown", handleKeydown);
}

// Start
boot();
