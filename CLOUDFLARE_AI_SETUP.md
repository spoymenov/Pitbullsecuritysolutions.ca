# Cloudflare AI Chat Setup (Gemini) — Pitbull Security Solutions Ltd.

## Recommended model choice
Use **Google Gemini `gemini-2.5-pro`** as primary model for strongest answer quality.
Use **`gemini-2.5-flash`** as fallback for speed/availability.

---

## 1) Create your Gemini API key (step-by-step)
1. Go to **Google AI Studio**: https://aistudio.google.com/
2. Sign in with your Google account.
3. Click **Get API key** (or open the API key panel from settings).
4. Create a new key and copy it.
5. Keep it private (never commit to git).

---

## 2) Install prerequisites
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

## 3) Prepare worker config
From repo root:
```bash
cp cloudflare/wrangler.toml.example wrangler.toml
```

The example includes:
- `GEMINI_MODEL = "gemini-2.5-pro"`
- `GEMINI_FALLBACK_MODEL = "gemini-2.5-flash"`
- `ALLOWED_ORIGIN = "https://pitbullsecuritysolutions.ca"`

---

## 4) Set secret key in Cloudflare
```bash
wrangler secret put GEMINI_API_KEY
```
Paste the key from Google AI Studio when prompted.

---

## 5) Deploy worker
```bash
wrangler deploy
```
You will get a URL like:
`https://pitbull-chat-worker.<subdomain>.workers.dev`

---

## 6) Connect frontend chat to worker
In `assistant-chat.js`, keep/set:
```js
const API_URL = "https://pitbull-chat-worker.spoymenov.workers.dev/api/chat";
```
Then deploy site files.

---

## 7) Production hardening
1. Restrict origin with `ALLOWED_ORIGIN`.
2. Add Cloudflare rate limiting on `/api/chat`.
3. Add Turnstile verification before calling Gemini.
4. Keep logs minimal (no sensitive message retention by default).

---

## 8) Troubleshooting
- **Error: Missing GEMINI_API_KEY secret**
  - Run `wrangler secret put GEMINI_API_KEY` again.
- **Model error from Gemini API**
  - Try fallback model (`gemini-2.5-flash`) in `wrangler.toml`.
- **CORS blocked in browser**
  - Verify `ALLOWED_ORIGIN` matches your deployed domain exactly.

---

## 9) Test checklist
1. Ask service-specific questions (access/camera/alarm/intercom/wiring).
2. Ask cannabis-specific questions.
3. Ask area coverage questions (York Region + GTA).
4. Ask urgent human escalation question and verify CTA appears.

---

## Legal/safety note
This assistant is for informational sales support only and should not provide legal, fire-code, or regulatory compliance advice.
