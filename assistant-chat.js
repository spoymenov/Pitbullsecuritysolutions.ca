(function () {
  const knowledge = {
    "access control": "We install commercial access control with card/fob/mobile credentials, door schedules, and audit logs across Newmarket and York Region.",
    "camera": "We design and install surveillance systems using Axis, Dahua, Speco, and GeoVision with remote viewing and retention planning.",
    "alarm": "We implement intrusion alarm systems with zoning, after-hours automation, and escalation workflows.",
    "intercom": "We install audio/video intercom and door entry systems integrated with access control for secure visitor workflows.",
    "wiring": "We provide structured low-voltage wiring (Cat6/Cat6A), patching, and expansion-ready infrastructure.",
    "automation": "We integrate smart automation and live monitoring workflows so cameras, access, and alarms work together."
  };

  const root = document.createElement('div');
  root.className = 'chat-widget';
  root.innerHTML = `
    <button class="chat-toggle" aria-label="Open chat support">Need help?</button>
    <section class="chat-panel" hidden>
      <header><strong>Pitbull Assistant</strong><button class="chat-close" aria-label="Close chat">×</button></header>
      <div class="chat-body">
        <p class="bot">Hi! Ask about services, coverage, pricing process, or timelines.</p>
      </div>
      <form class="chat-form">
        <input type="text" name="q" placeholder="Type your question..." required />
        <button type="submit">Send</button>
      </form>
      <div class="chat-escalate">
        <a href="tel:8889635633">Call 888-963-5633</a>
        <a href="mailto:info@pitbullsecuritysolutions.ca?subject=Website%20Chat%20Escalation">Escalate to Team</a>
      </div>
    </section>
  `;

  document.body.appendChild(root);

  const panel = root.querySelector('.chat-panel');
  const body = root.querySelector('.chat-body');
  root.querySelector('.chat-toggle').addEventListener('click', () => panel.hidden = false);
  root.querySelector('.chat-close').addEventListener('click', () => panel.hidden = true);

  root.querySelector('.chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.q;
    const text = input.value.trim();
    if (!text) return;

    const user = document.createElement('p');
    user.className = 'user';
    user.textContent = text;
    body.appendChild(user);

    const lower = text.toLowerCase();
    let answer = "I can help with access control, cameras, alarms, intercom, wiring, automation, service areas, and consultation process.";

    for (const key of Object.keys(knowledge)) {
      if (lower.includes(key)) answer = knowledge[key];
    }

    if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) {
      answer = "Pricing depends on site layout and scope. For accurate pricing, request a consultation and we’ll provide a tailored quote.";
    }

    if (lower.includes('area') || lower.includes('where')) {
      answer = "We serve Newmarket, Aurora, Richmond Hill, East Gwillimbury, Bradford, Georgina/Keswick, and Vaughan.";
    }

    const bot = document.createElement('p');
    bot.className = 'bot';
    bot.textContent = answer;
    body.appendChild(bot);

    const shouldEscalate = lower.includes('human') || lower.includes('agent') || lower.includes('owner') || lower.includes('complex');
    if (shouldEscalate) {
      const esc = document.createElement('p');
      esc.className = 'bot';
      esc.innerHTML = 'I’ll hand this off. Please call <a href="tel:8889635633">888-963-5633</a> or email <a href="mailto:info@pitbullsecuritysolutions.ca">info@pitbullsecuritysolutions.ca</a>.';
      body.appendChild(esc);
    }

    body.scrollTop = body.scrollHeight;
    input.value = '';
  });
})();
