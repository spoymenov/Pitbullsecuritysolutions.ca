(function () {
  const API_URL = "https://pitbull-chat-worker.spoymenov.workers.dev/api/chat";

  const business = {
    phone: "888-963-5633",
    phoneHref: "tel:8889635633",
    email: "info@pitbullsecuritysolutions.ca",
    emailHref: "mailto:info@pitbullsecuritysolutions.ca",
    areas: ["newmarket", "aurora", "richmond hill", "east gwillimbury", "bradford", "georgina", "keswick", "vaughan", "markham", "toronto", "mississauga", "brampton", "gta", "greater toronto area"]
  };

  const localFallback = {
    access: "Pitbull specializes in commercial-first access control with credential, schedule, and audit capabilities.",
    cameras: "We deploy camera systems with remote visibility and retention planning for business needs.",
    alarms: "Alarm systems are configured around intrusion risk, zoning, and escalation workflows.",
    intercom: "Intercom systems are integrated with access control and video verification for secure entry.",
    wiring: "Structured Cat6/Cat6A low-voltage wiring supports security performance and future expansion.",
    automation: "Automation connects access, alarms, and cameras into one practical workflow.",
    areas: "We serve Ontario projects in York Region + GTA: Newmarket, Aurora, Richmond Hill, East Gwillimbury, Bradford, Georgina/Keswick, Vaughan, Markham, Toronto, Mississauga, and Brampton.",
    fallback: "I can help with services, pricing process, and coverage areas. If needed, I can connect you directly with Pitbull now."
  };

  const root = document.createElement("div");
  root.className = "chat-widget";
  root.innerHTML = `
    <button class="chat-toggle" aria-label="Open chat support">Chat with Pitbull</button>
    <section class="chat-panel" hidden>
      <header><strong>Pitbull Assistant</strong><button class="chat-close" aria-label="Close chat">×</button></header>
      <div class="chat-body"><p class="bot">Hi — ask me anything about Pitbull services, areas, consultation flow, or pricing approach.</p></div>
      <form class="chat-form">
        <input type="text" name="q" placeholder="Ask about your project..." required />
        <button type="submit">Send</button>
      </form>
      <div class="chat-escalate">
        <a href="${business.phoneHref}">Call ${business.phone}</a>
        <a href="mailto:${business.email}?subject=Website%20Chat%20Escalation">Escalate to Team</a>
      </div>
    </section>
  `;

  document.body.appendChild(root);

  const panel = root.querySelector(".chat-panel");
  const body = root.querySelector(".chat-body");
  const form = root.querySelector(".chat-form");
  const input = form.q;
  const history = [];

  root.querySelector(".chat-toggle").addEventListener("click", () => (panel.hidden = false));
  root.querySelector(".chat-close").addEventListener("click", () => (panel.hidden = true));

  function addMessage(type, text, html = false) {
    const p = document.createElement("p");
    p.className = type;
    if (html) p.innerHTML = text;
    else p.textContent = text;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  function fallbackAnswer(text) {
    const t = text.toLowerCase();
    if (t.includes("access") || t.includes("card") || t.includes("fob")) return localFallback.access;
    if (t.includes("camera") || t.includes("cctv") || t.includes("surveillance")) return localFallback.cameras;
    if (t.includes("alarm") || t.includes("intrusion")) return localFallback.alarms;
    if (t.includes("intercom") || t.includes("door entry")) return localFallback.intercom;
    if (t.includes("wire") || t.includes("cat6") || t.includes("cable")) return localFallback.wiring;
    if (t.includes("automation") || t.includes("monitoring")) return localFallback.automation;
    if (business.areas.some((a) => t.includes(a)) || t.includes("where") || t.includes("area")) return localFallback.areas;
    return localFallback.fallback;
  }

  function maybeEscalate(text) {
    const t = text.toLowerCase();
    return ["human", "agent", "owner", "urgent", "emergency", "complex", "quote now", "call me"].some((w) => t.includes(w));
  }

  async function askAI(message) {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        pageContext: { path: window.location.pathname, title: document.title }
      })
    });
    if (!resp.ok) throw new Error("AI endpoint unavailable");
    const data = await resp.json();
    return data.reply || localFallback.fallback;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage("user", message);
    input.value = "";

    let reply;
    try {
      reply = await askAI(message);
    } catch {
      reply = fallbackAnswer(message);
    }

    addMessage("bot", reply);
    history.push({ role: "user", content: message }, { role: "assistant", content: reply });

    if (maybeEscalate(message)) {
      addMessage(
        "bot",
        `I’ll hand this off now. Call <a href="${business.phoneHref}">${business.phone}</a> or email <a href="${business.emailHref}">${business.email}</a>.`,
        true
      );
    }
  });
})();
