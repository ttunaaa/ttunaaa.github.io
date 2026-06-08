# ttunaaa.github.io

# Coen Fink Automation Systems

A static business-facing website for `coenfink.com` that showcases practical AI automation demos for small businesses.

## Open locally

Open `index.html` directly in a browser, or open this folder in VS Code and use Live Server.

No build step is required. The site uses plain HTML, CSS, and JavaScript.

## Project structure

- `index.html` - Page structure and demo sections.
- `styles.css` - Dark SaaS-style responsive design.
- `script.js` - Local demo interactions and future webhook placeholders.
- `README.md` - Setup notes and integration guidance.

## Demos

1. Smart Quote Request Form
   - Simulates a home services quote form.
   - Calls n8n/OpenAI for lead analysis when `QUOTE_WEBHOOK_URL` is reachable.
   - Displays lead type, urgency, lead score, estimated value, suggested reply, owner notification, and simulated workflow actions.

2. Website Knowledge Assistant
   - Simulates a small business FAQ assistant.
   - Includes clickable sample questions and a text input with canned demo responses.

3. Lead Follow-Up Simulator
   - Simulates a missed real estate or rental lead.
   - Reveals a timeline and generated follow-up email preview.

4. AI Receptionist / Missed Call Assistant
   - Simulates an incoming call transcript.
   - Produces a structured call summary and staff action.

5. Customer Request Organizer
   - Organizes a messy pasted request.
   - Uses simple keyword logic for category and urgency.

## n8n webhook placeholders

Paste future n8n webhook URLs at the top of `script.js`:

```js
const QUOTE_WEBHOOK_URL = "https://example.com/webhook/smart-quote";
const CHAT_WEBHOOK_URL = "https://example.com/webhook/website-assistant";
const FOLLOWUP_WEBHOOK_URL = "https://example.com/webhook/lead-followup";
const CALL_WEBHOOK_URL = "https://example.com/webhook/missed-call";
const ORGANIZER_WEBHOOK_URL = "https://example.com/webhook/request-organizer";
```

The Smart Quote Request Form is currently a demo-mode automation. It calls n8n/OpenAI for analysis and displays what would happen in a real business workflow. It does not yet send real emails, write to a CRM, or store submissions. Future production versions can connect those actions in n8n.

The website itself does not expose API keys; keep any AI provider API keys inside n8n credentials or environment variables.

## Connecting the Smart Quote Form to n8n

1. Create an n8n workflow with a Webhook trigger.
2. Copy the webhook URL into `QUOTE_WEBHOOK_URL` in `script.js`.
3. Send the form payload as JSON: name, email, business type, and message.
4. In n8n, summarize the lead, draft a reply, and return JSON fields such as `leadType`, `urgency`, `leadScore`, `estimatedValue`, `summary`, `suggestedReply`, and `ownerNotification`.
5. Render those returned fields in `quote-result`.

## Future GitHub Pages production setup

GitHub Pages can keep hosting the static website. The live site cannot call `http://pickle:5678` directly because browsers block mixed-content and insecure cross-origin requests from a public HTTPS page.

Eventually, use an HTTPS public endpoint such as `https://api.coenfink.com/quote`. That endpoint can point to n8n through Cloudflare Tunnel or another secure reverse proxy. Then update `QUOTE_WEBHOOK_URL` in `script.js` to the HTTPS endpoint.
