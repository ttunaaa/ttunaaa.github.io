const QUOTE_WEBHOOK_URL = "https://api.coenfink.com/webhook/a2cf91f3-94d5-49fa-a4f4-005a745d8f26";
const CHAT_WEBHOOK_URL = "http://api.coenfink.com/webhook/website-assistant";
const FOLLOWUP_WEBHOOK_URL = "https://example.com/webhook/lead-followup";
const CALL_WEBHOOK_URL = "https://example.com/webhook/missed-call";
const ORGANIZER_WEBHOOK_URL = "https://example.com/webhook/request-organizer";

const quoteForm = document.querySelector("#quote-form");
const quoteResult = document.querySelector("#quote-result");
const chatBox = document.querySelector("#chat-box");
const chatForm = document.querySelector("#chat-form");
const sampleQuestionButtons = document.querySelectorAll("[data-question]");
const followupButton = document.querySelector("#followup-button");
const followupTimeline = document.querySelector("#followup-timeline");
const followupEmail = document.querySelector("#followup-email");
const callButton = document.querySelector("#call-button");
const callTranscript = document.querySelector("#call-transcript");
const callSummary = document.querySelector("#call-summary");
const organizerForm = document.querySelector("#organizer-form");
const organizerResult = document.querySelector("#organizer-result");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setResult(element, html) {
  element.classList.remove("empty");
  element.innerHTML = html;
}

function renderList(items) {
  return `<ul class="result-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function renderQuoteActions() {
  return `
    <strong>Actions That Would Have Happened:</strong>
    ${renderList([
      "✓ Lead added to CRM",
      "✓ Owner notified",
      "✓ Follow-up email drafted",
      "✓ Lead scored and prioritized"
    ])}
  `;
}

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(quoteForm));
  const submitButton = quoteForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  const startTime = performance.now();

  submitButton.disabled = true;
  submitButton.textContent = "Analyzing lead...";
  setResult(quoteResult, "Generating AI lead summary...");

  try {
    const response = await fetch(QUOTE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    const result = await response.json();
    const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(1);

    setResult(
      quoteResult,
      `
        <p><strong>✓ Lead Ready For Follow-Up</strong></p>
        <p>Analysis completed in ${elapsedSeconds} seconds</p>
        ${renderList([
          `<strong>Lead type:</strong> ${escapeHtml(result.leadType || "Unknown")}`,
          `<strong>Urgency:</strong> ${escapeHtml(result.urgency || "Unknown")}`,
          `<strong>Lead Score:</strong> ${escapeHtml(result.leadScore ?? "Not scored")}`,
          `<strong>Estimated Value:</strong> ${escapeHtml(result.estimatedValue ?? "Not estimated")}`,
          `<strong>Summary:</strong> ${escapeHtml(result.summary || "No summary returned.")}`,
          `<strong>Suggested reply:</strong> ${escapeHtml(result.suggestedReply || "No reply returned.")}`,
          `<strong>Owner notification:</strong> ${escapeHtml(result.ownerNotification || "No owner notification returned.")}`,
          renderQuoteActions()
        ])}
      `
    );
  } catch (error) {
    console.error(error);

    const fallbackUrgency = /urgent|today|tomorrow|before friday/i.test(data.message || "") ? "High" : "Normal";
    const fallbackLeadType = `${data.businessType || "Service"} quote request`;
    const fallbackSummary = `${data.name || "A visitor"} requested a quote for ${data.businessType || "a service"}. Request: ${data.message || "No request details provided."}`;

    setResult(quoteResult, renderList([
      `<strong>Demo fallback preview:</strong> The live automation could not be reached, so this local preview shows what the workflow would display.`,
      `<strong>Lead type:</strong> ${escapeHtml(fallbackLeadType)}`,
      `<strong>Urgency:</strong> ${escapeHtml(fallbackUrgency)}`,
      `<strong>Lead Score:</strong> Not scored`,
      `<strong>Estimated Value:</strong> Not estimated`,
      `<strong>Summary:</strong> ${escapeHtml(fallbackSummary)}`,
      `<strong>Suggested reply:</strong> Thanks for reaching out. A real workflow would draft a tailored reply with next steps and any missing quote details.`,
      `<strong>Owner notification:</strong> Demo mode only. The owner notification would be prepared here, but nothing is sent.`,
      `<strong>Status:</strong> The automation service is temporarily unavailable. Please try again in a moment.`,
      renderQuoteActions()
    ]));
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

let isChatRequestInProgress = false;

function addChatMessage(role, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

function removeChatMessage(message) {
  message.remove();
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setChatControlsDisabled(disabled) {
  chatForm.querySelector('button[type="submit"]').disabled = disabled;
  sampleQuestionButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

async function answerChatQuestion(question) {
  if (isChatRequestInProgress) return;

  isChatRequestInProgress = true;
  setChatControlsDisabled(true);

  addChatMessage("user", question);
  const thinkingMessage = addChatMessage("assistant", "Thinking...");

  try {
    const response = await fetch(CHAT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error(`Assistant webhook failed with status ${response.status}`);
    }

    const result = await response.json();
    thinkingMessage.textContent = result.answer || "No answer returned.";
  } catch (error) {
    console.error(error);
    removeChatMessage(thinkingMessage);
    addChatMessage("assistant", "Sorry, I couldn't reach the assistant right now.");
  } finally {
    isChatRequestInProgress = false;
    setChatControlsDisabled(false);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

sampleQuestionButtons.forEach((button) => {
  button.addEventListener("click", () => answerChatQuestion(button.dataset.question));
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isChatRequestInProgress) return;

  const input = chatForm.elements.chatInput;
  const question = input.value.trim();
  if (!question) return;

  await answerChatQuestion(question);
  input.value = "";
});

followupButton.addEventListener("click", () => {
  const steps = [
    "Lead submits tour request",
    "AI scores lead as high intent",
    "No response detected after 24 hours",
    "Follow-up email drafted",
    "Lead marked as warm"
  ];

  followupTimeline.innerHTML = "";
  followupEmail.classList.add("empty");
  followupEmail.textContent = "Generating follow-up email preview...";

  // Later n8n integration:
  // Trigger FOLLOWUP_WEBHOOK_URL with the lead details and use the workflow response to build this timeline.
  steps.forEach((step, index) => {
    window.setTimeout(() => {
      const item = document.createElement("div");
      item.className = "timeline-step";
      item.innerHTML = `<span>${index + 1}</span><strong>${step}</strong>`;
      followupTimeline.appendChild(item);
    }, index * 230);
  });

  window.setTimeout(() => {
    setResult(followupEmail, `
      <strong>Generated follow-up email:</strong><br>
      Hi Taylor, just checking in on your tour request for the two-bedroom rental. If you are still interested, I can help confirm availability and send over open viewing times for this week.
    `);
  }, steps.length * 250);
});

callButton.addEventListener("click", () => {
  const lines = [
    ["AI", "Thanks for calling. What can I help you with?"],
    ["Customer", "I need to book an appointment."],
    ["AI", "What day works best?"],
    ["Customer", "Tomorrow afternoon."],
    ["AI", "Got it. I will send this to the team."]
  ];

  callTranscript.innerHTML = "";
  callSummary.classList.add("empty");
  callSummary.textContent = "Listening to mock call...";

  // Later n8n integration:
  // POST call metadata or transcript data to CALL_WEBHOOK_URL, then render the structured summary from n8n.
  lines.forEach(([speaker, text], index) => {
    window.setTimeout(() => {
      const line = document.createElement("div");
      line.className = "transcript-line";
      line.innerHTML = `<strong>${speaker}:</strong> ${escapeHtml(text)}`;
      callTranscript.appendChild(line);
    }, index * 320);
  });

  window.setTimeout(() => {
    setResult(callSummary, renderList([
      "<strong>Name:</strong> Example customer",
      "<strong>Need:</strong> Appointment request",
      "<strong>Urgency:</strong> Normal",
      "<strong>Action:</strong> Notify staff / create callback task"
    ]));
  }, lines.length * 340);
});

organizerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const requestText = organizerForm.elements.requestText.value.trim();
  const lower = requestText.toLowerCase();
  const urgency = /urgent|today|tomorrow|before friday/.test(lower) ? "High" : "Normal";
  let category = "General request";

  if (/refund|order|tracking/.test(lower)) {
    category = "Support";
  } else if (/quote|estimate|price/.test(lower)) {
    category = "Sales lead";
  }

  const keyDetails = requestText
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);

  const nextAction = category === "Sales lead"
    ? "Send quote intake questions and notify the owner."
    : category === "Support"
      ? "Create support ticket and ask for account or order details if missing."
      : "Route to the correct team member with the summarized request.";

  // Later n8n integration:
  // Replace this local keyword logic with a POST to ORGANIZER_WEBHOOK_URL and render the workflow output.
  setResult(organizerResult, renderList([
    `<strong>Category:</strong> ${category}`,
    `<strong>Urgency:</strong> ${urgency}`,
    `<strong>Key details:</strong> ${escapeHtml(keyDetails.join(" | ") || "No clear details found")}`,
    `<strong>Suggested next action:</strong> ${nextAction}`
  ]));
});
