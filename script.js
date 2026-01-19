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
    print("Interested in systems, optimization, and building
