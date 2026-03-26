function buildCorsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function inferFocus(message = '', pageContext = {}) {
  const text = `${message} ${pageContext?.path || ''} ${pageContext?.title || ''}`.toLowerCase();

  if (text.includes('access') || text.includes('card') || text.includes('fob')) return 'access-control';
  if (text.includes('camera') || text.includes('cctv') || text.includes('surveillance')) return 'camera-systems';
  if (text.includes('alarm') || text.includes('intrusion')) return 'alarm-systems';
  if (text.includes('intercom') || text.includes('door entry')) return 'intercom';
  if (text.includes('wire') || text.includes('cat6') || text.includes('cable')) return 'structured-wiring';
  if (text.includes('automation') || text.includes('monitoring')) return 'automation-monitoring';
  if (text.includes('cannabis') || text.includes('dispensary') || text.includes('production facility') || text.includes('factory')) return 'cannabis-security';
  if (text.includes('where') || text.includes('area') || text.includes('newmarket') || text.includes('aurora') || text.includes('toronto') || text.includes('gta') || text.includes('markham') || text.includes('vaughan')) return 'service-areas';

  return 'general';
}

function serviceHint(focus) {
  const hints = {
    'access-control': 'Focus on commercial access control rollout options: doors/readers, user roles, schedules, audit logs, and expansion planning.',
    'camera-systems': 'Focus on camera coverage planning: entrances, loading zones, parking, retention windows, and remote/mobile visibility.',
    'alarm-systems': 'Focus on alarm zoning and escalation: intrusion points, armed states, notifications, and monitored-response workflows.',
    intercom: 'Focus on visitor entry workflows: call stations, remote unlock, and integration with access/camera systems.',
    'structured-wiring': 'Focus on low-voltage infrastructure: Cat6/Cat6A runs, rack/patch planning, and clean expansion-ready cabling.',
    'automation-monitoring': 'Focus on integrated workflows: linking access + alarms + cameras into one practical operating flow.',
    'service-areas': 'Focus on Ontario coverage in York Region core areas and GTA project coverage.',
    'cannabis-security': 'Focus on cannabis stores, production warehouses, and factories: layered access, camera traceability, and alarm escalation.',
    general: 'Focus on quickly identifying the customer project and recommending a consultation path.'
  };

  return hints[focus] || hints.general;
}

function mapHistoryForGemini(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
}

async function callGemini({ env, model, systemPrompt, contents }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: Number(env.GEMINI_MAX_OUTPUT_TOKENS || 1200)
      },
      thinkingConfig: {
        thinkingBudget: Number(env.GEMINI_THINKING_BUDGET || 8192)
      }
    })
  });
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p?.text || '').join('\n').trim();
  return text;
}

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname === '/api/chat/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        ok: true,
        provider: 'gemini',
        primary_model: env.GEMINI_MODEL || 'gemini-2.5-pro',
        fallback_model: env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash',
        thinking_budget: Number(env.GEMINI_THINKING_BUDGET || 8192)
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (url.pathname !== '/api/chat') {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { message, history = [], pageContext = {} } = await request.json();
      if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY secret' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const focus = inferFocus(message, pageContext);
      const hint = serviceHint(focus);

      const systemPrompt = `You are Pitbull Security Solutions Ltd.'s website assistant.
Business facts:
- Phone: 888-963-5633
- Email: info@pitbullsecuritysolutions.ca
- Address: 925 Isaac Phillips Way, Newmarket, ON L3X 0M7
- Service areas: Ontario only, with York Region core (Newmarket, Aurora, Richmond Hill, East Gwillimbury, Bradford, Georgina/Keswick) + GTA project coverage (Vaughan, Markham, Toronto, Mississauga, Brampton)
- Services: commercial access control, camera systems, alarm systems, intercom/door entry, structured low-voltage wiring, automation + live monitoring
- Specialization: cannabis stores, production warehouses, and factories

Style requirements:
1) Do not be generic. Provide concrete, practical recommendations tailored to the user scenario.
2) Give a concise but complete answer in 4-8 bullets or short paragraphs.
3) If data is missing, ask up to 2 clarifying questions.
4) Include at least one next step and estimated scope factors (not fake prices).
5) End with CTA: phone + email.
6) Reference Ontario-local coverage when relevant.

Current conversation focus: ${focus}
Guidance for this focus: ${hint}`;

      const contents = [
        ...mapHistoryForGemini(history),
        {
          role: 'user',
          parts: [{ text: `Page context: ${pageContext?.path || 'unknown-path'} | ${pageContext?.title || 'unknown-title'}\nUser message: ${message}` }]
        }
      ];

      const primaryModel = env.GEMINI_MODEL || 'gemini-2.5-pro';
      const fallbackModel = env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';

      let resp = await callGemini({ env, model: primaryModel, systemPrompt, contents });
      let usedModel = primaryModel;

      if (!resp.ok && fallbackModel && fallbackModel !== primaryModel) {
        resp = await callGemini({ env, model: fallbackModel, systemPrompt, contents });
        usedModel = fallbackModel;
      }

      if (!resp.ok) {
        const detail = await resp.text();
        return new Response(JSON.stringify({ error: 'LLM upstream error', detail }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await resp.json();
      const text = extractGeminiText(data) ||
        'I can provide a practical Ontario-focused security recommendation for your site. Call 888-963-5633 or email info@pitbullsecuritysolutions.ca.';

      return new Response(JSON.stringify({ reply: text, focus, model: usedModel, provider: 'gemini' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Server error', detail: String(error) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
