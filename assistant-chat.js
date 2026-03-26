(function () {
  const business = {
    name: "Pitbull Security Solutions Ltd.",
    phone: "888-963-5633",
    phoneHref: "tel:8889635633",
    email: "info@pitbullsecuritysolutions.ca",
    emailHref: "mailto:info@pitbullsecuritysolutions.ca",
    address: "925 Isaac Phillips Way, Newmarket, ON L3X 0M7",
    areas: ["newmarket", "aurora", "richmond hill", "east gwillimbury", "bradford", "georgina", "keswick", "vaughan"]
  };

  const responses = {
    access_control: "Pitbull specializes in commercial-first access control: card/fob/mobile credentials, door schedules, role-based permissions, and audit-ready event logs.",
    cameras: "For camera systems, we design coverage maps and deploy Axis, Dahua, Speco, and GeoVision solutions with remote visibility and retention planning.",
    alarms: "Alarm systems are designed around your risk profile: intrusion zoning, after-hours logic, mobile alerts, and escalation workflows.",
    intercom: "Our intercom/door entry systems tie directly into access control and cameras for secure visitor verification and controlled unlock workflows.",
    wiring: "Structured wiring includes Cat6/Cat6A low-voltage runs, rack/patch organization, and expansion-ready infrastructure for long-term reliability.",
    automation: "Automation/monitoring connects access, alarms, and cameras into one practical workflow, including live video monitoring strategies.",
    areas: "Pitbull serves Newmarket, Aurora, Richmond Hill, East Gwillimbury, Bradford, Georgina/Keswick, and Vaughan.",
    consultation: "Consultation flow: 1) site + risk review, 2) scope and system design, 3) installation plan, 4) commissioning + user handoff.",
    pricing: "Pricing is scoped to door count, camera count, wiring complexity, and integration depth. Best next step is a consultation for an accurate quote.",
    contact: `You can reach ${business.name} at ${business.phone} or ${business.email}.`,
    fallback: "I can answer questions about access control, cameras, alarms, intercom, structured wiring, automation, service areas, and consultation steps. If you want, I can connect you directly now."
  };

  const intents = [
    { key: "access_control", terms: ["access", "card", "credential", "door control", "fob", "reader"] },
    { key: "cameras", terms: ["camera", "cctv", "surveillance", "nvr", "video"] },
    { key: "alarms", terms: ["alarm", "intrusion", "sensor", "alert"] },
    { key: "intercom", terms: ["intercom", "door entry", "doorbell", "visitor"] },
    { key: "wiring", terms: ["wiring", "cat6", "cabling", "low voltage", "network cable"] },
    { key: "automation", terms: ["automation", "smart", "monitoring", "integrated"] },
    { key: "consultation", terms: ["consultation", "assessment", "site visit", "appointment", "book"] },
    { key: "pricing", terms: ["price", "cost", "quote", "estimate", "budget"] },
    { key: "contact", terms: ["phone", "email", "contact", "address", "call"] }
  ];

  const root = document.createElement("div");
  root.className = "chat-widget";
  root.innerHTML = `
    <button class="chat-toggle" aria-label="Open chat support">Chat with Pitbull</button>
    <section class="chat-panel" hidden>
      <header><strong>Pitbull Assistant</strong><button class="chat-close" aria-label="Close chat">×</button></header>
      <div class="chat-body">
        <p class="bot">Hi — I’m the Pitbull assistant. I can help with services, areas, project process, and pricing guidance.</p>
      </div>
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
  const toggle = root.querySelector(".chat-toggle");
  const close = root.querySelector(".chat-close");
  const form = root.querySelector(".chat-form");

  toggle.addEventListener("click", () => (panel.hidden = false));
  close.addEventListener("click", () => (panel.hidden = true));

  function detectAreaQuestion(text) {
    return business.areas.some((a) => text.includes(a));
  }

  function detectIntent(text) {
    for (const intent of intents) {
      if (intent.terms.some((term) => text.includes(term))) return intent.key;
    }
    if (detectAreaQuestion(text) || text.includes("service area") || text.includes("where")) return "areas";
    return "fallback";
  }

  function maybeEscalate(text) {
    return ["human", "agent", "owner", "complex", "urgent", "emergency", "can\'t", "cannot"].some((w) => text.includes(w));
  }

  function addMessage(type, htmlOrText, isHtml = false) {
    const p = document.createElement("p");
    p.className = type;
    if (isHtml) p.innerHTML = htmlOrText;
    else p.textContent = htmlOrText;
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.q;
    const raw = input.value.trim();
    if (!raw) return;

    addMessage("user", raw);

    const text = raw.toLowerCase();
    const intent = detectIntent(text);
    addMessage("bot", responses[intent] || responses.fallback);

    if (intent === "consultation") {
      addMessage(
        "bot",
        `To get started, contact <a href="${business.phoneHref}">${business.phone}</a> or email <a href="${business.emailHref}">${business.email}</a>.`,
        true
      );
    }

    if (maybeEscalate(text)) {
      addMessage(
        "bot",
        `No problem — I’ll escalate this. Call <a href="${business.phoneHref}">${business.phone}</a> or email <a href="${business.emailHref}">${business.email}</a> and mention your website chat message.`,
        true
      );
    }

    input.value = "";
  });
})();
