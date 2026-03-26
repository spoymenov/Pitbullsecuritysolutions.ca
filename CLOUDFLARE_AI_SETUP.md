# Cloudflare AI Chat Setup (Pitbull Security Solutions Ltd.)

## Recommended model choice
Use **OpenAI `gpt-5`** for strongest answer quality and reasoning depth.

If `gpt-5` is not available in your account/region, set fallback to `gpt-4.1-mini`.

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
- `OPENAI_MODEL` (`gpt-5`)
- `OPENAI_FALLBACK_MODEL` (`gpt-4.1-mini`)
- `REASONING_EFFORT` (`high`)

---

## 4) Deploy worker
```bash
wrangler deploy
```
This outputs your worker URL (example):
`https://pitbull-chat-worker.<subdomain>.workers.dev`

---


### Wrangler warning cleanup (recommended)
Add these explicit settings in `wrangler.toml` to avoid default-behavior warnings:

```toml
workers_dev = true
preview_urls = false
```

If you plan to serve the Worker only from a custom domain route, set `workers_dev = false` and add a `routes` config.

---

## 5) Connect frontend chat to worker
In `assistant-chat.js`, set:
```js
const API_URL = "https://pitbull-chat-worker.spoymenov.workers.dev/api/chat";
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


## 8) If answers still feel generic
1. Confirm your site is using the current `assistant-chat.js` (hard refresh / cache-bust).
2. Confirm the Worker is redeployed after prompt updates (`wrangler deploy`).
3. Ensure frontend sends `pageContext` (`path` + `title`) with each message.
4. Ask targeted prompts like: "2-door office in Aurora, card + mobile, rough scope?"
5. If output is still generic, lower temperature to `0.1` and tighten system prompt constraints further.

---


## 9) Reasoning quality tuning
To make answers less generic and more "real-life consultative":
- keep `OPENAI_MODEL=gpt-5`
- keep `REASONING_EFFORT=high`
- raise `max_output_tokens` in worker when you need deeper answers
- keep a fallback model (`OPENAI_FALLBACK_MODEL`) for account compatibility

---

## Legal/safety note
This assistant is for informational sales support only and should not provide legal, fire-code, or regulatory compliance advice.
