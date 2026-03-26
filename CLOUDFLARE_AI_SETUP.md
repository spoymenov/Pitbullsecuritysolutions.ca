# Cloudflare AI Chat Setup (Pitbull Security Solutions Ltd.)

## Recommended model choice
Use **OpenAI `gpt-4.1-mini`** for best balance of:
- reasoning quality
- fast response
- low operating cost

---

## 1) Install prerequisites
1. Install Node.js LTS
2. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
3. Login to Cloudflare:
   ```bash
   wrangler login
   ```

---

## 2) Add worker files to your repo
Files added:
- `cloudflare/worker.js`
- `cloudflare/wrangler.toml.example`

Copy example config:
```bash
cp cloudflare/wrangler.toml.example wrangler.toml
```

---

## 3) Set secrets securely (never commit keys)
```bash
wrangler secret put OPENAI_API_KEY
```
Paste your OpenAI key when prompted.

Optional variables are already in `wrangler.toml`:
- `ALLOWED_ORIGIN` (your production domain)
- `OPENAI_MODEL` (`gpt-4.1-mini`)

---

## 4) Deploy worker
```bash
wrangler deploy
```
This outputs your worker URL (example):
`https://pitbull-chat-worker.<subdomain>.workers.dev`

---

## 5) Connect frontend chat to worker
In `assistant-chat.js`, set:
```js
const API_URL = "https://pitbull-chat-worker.<subdomain>.workers.dev/api/chat";
```

Then deploy your site update.

---

## 6) Optional but strongly recommended hardening

### A) Restrict origin
Set `ALLOWED_ORIGIN` to:
- `https://pitbullsecuritysolutions.ca`

### B) Add basic rate limiting
Use Cloudflare Rate Limiting rule on `/api/chat`:
- e.g. 20 requests/minute per IP.

### C) Add abuse protection (Turnstile)
- Add Turnstile token to chat form.
- Verify token in worker before calling LLM.

### D) Logging + privacy
- Log only minimal metadata (timestamp, coarse intent).
- Avoid storing personal message content by default.

### E) Human escalation path
Always include clear escalation in frontend and AI response:
- Phone: `888-963-5633`
- Email: `info@pitbullsecuritysolutions.ca`

### F) Monitoring
- Enable Cloudflare Worker Analytics.
- Track error rates and response latency.

---

## 7) Production test checklist
1. Ask about each service (access, cameras, alarms, intercom, wiring, automation).
2. Ask area coverage questions.
3. Ask price quote question.
4. Ask for human support (verify immediate escalation).
5. Verify only your domain can call the endpoint.

---

## Legal/safety note
This assistant is for informational sales support only and should not provide legal, fire-code, or regulatory compliance advice.
