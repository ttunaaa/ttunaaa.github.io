const terminal = document.getElementById("terminal");

const lines = [
  "coen@portfolio:~$ whoami\n",
  "Finance + Financial Math + CS student.\n",
  "Interested in systems, optimization, and building things.\n\n",
  "coen@portfolio:~$ ls\n",
  "projects  writing  notes  about\n\n",
  "coen@portfolio:~$ "
];

let lineIndex = 0;
let charIndex = 0;

function type() {
  if (lineIndex < lines.length) {
    if (charIndex < lines[lineIndex].length) {
      terminal.textContent += lines[lineIndex][charIndex];
      charIndex++;
      setTimeout(type, 30); // typing speed
    } else {
      terminal.textContent += "\n";
      lineIndex++;
      charIndex = 0;
      setTimeout(type, 400); // pause between lines
    }
  } else {
    addCursor();
  }
}

function addCursor() {
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.textContent = "█";
  terminal.appendChild(cursor);
}

type();
