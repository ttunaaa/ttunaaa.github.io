const terminal = document.getElementById("terminal");
const screen = terminal.parentElement;

const PROMPT = "coen@portfolio:~$ ";
let currentInput = "";
let acceptingInput = false;

/* ---------- utilities ---------- */

function scrollBottom() {
  screen.scrollTop = screen.scrollHeight;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addLine() {
  const line = document.createElement("div");
  terminal.appendChild(line);
  scrollBottom();
  return line;
}

async function typeText(el, text, speed = 22) {
  for (const ch of text) {
    el.appendChild(document.createTextNode(ch));
    scrollBottom();
    await sleep(speed);
  }
}

function clearScreen() {
  terminal.innerHTML = "";
}

/* ---------- prompt handling ---------- */

let inputLine, inputEl, cursorEl;

function renderPrompt() {
  inputLine = addLine();

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = PROMPT;

  inputEl = document.createElement("span");
  inputEl.className = "input";

  cursorEl = document.createElement("span");
  cursorEl.className = "cursor";
  cursorEl.textContent = "█";

  inputLine.append(prompt, inputEl, cursorEl);

  currentInput = "";
  acceptingInput = true;
}

function finalizePrompt() {
  if (cursorEl) cursorEl.remove();
  acceptingInput = false;
}

/* ---------- output ---------- */

function print(text = "") {
  const line = addLine();
  line.textContent = text;
}

function printLinks() {
  const line = addLine();
  const items = [
    { label: "projects", href: "projects.html" },
    { label: "about", href: "about.html" }
  ];

  items.forEach((item, i) => {
    const a = document.createElement("a");
    a.className = "term-link";
    a.href = item.href;
    a.textContent = item.label;
    line.appendChild(a);
    if (i < items.length - 1) {
      line.appendChild(document.createTextNode("  "));
    }
  });
}


/* ---------- commands ---------- */

function runCommand(cmd) {
  cmd = cmd.trim();

  if (cmd === "") return;

  if (cmd === "help") {
    print("Available commands:");
    print("  help");
    print("  whoami");
    print("  ls");
    print("  clear");
    return;
  }

  if (cmd === "whoami") {
    print("Coen Fink — Finance + Financial Math + CS.");
    print("Interested in systems, optimization, and building things.");
    return;
  }

  if (cmd === "ls") {
    printLinks();
    return;
  }

  if (cmd === "clear") {
  clearScreen();
  return;
}

if (cmd === "projects") {
  print("Opening projects...");
  window.location.href = "projects.html";
  return;
}

if (cmd === "about") {
  print("Opening about...");
  window.location.href = "about.html";
  return;
}

  print(`command not found: ${cmd}`);
}

/* ---------- keyboard ---------- */

function handleKey(e) {
  if (!acceptingInput) return;

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === "Enter") {
    finalizePrompt();
    const wasClear = currentInput.trim() === "clear";
    runCommand(currentInput);
    if (!wasClear) renderPrompt();
    e.preventDefault();
    return;
  }

  if (e.key === "Backspace") {
    if (currentInput.length > 0) {
      currentInput = currentInput.slice(0, -1);
      inputEl.textContent = currentInput;
    }
    e.preventDefault();
    return;
  }

  if (e.key.length !== 1) return;

  currentInput += e.key;
  inputEl.textContent = currentInput;
  e.preventDefault();
}

/* ---------- boot sequence ---------- */

async function boot() {
  clearScreen();

  await typeText(addLine(), "Booting coenfink.com...");
  await typeText(addLine(), "Loading terminal environment...");
  await typeText(addLine(), "Type 'help' to begin.");
  addLine();

  renderPrompt();
  window.addEventListener("keydown", handleKey);
}

boot();
