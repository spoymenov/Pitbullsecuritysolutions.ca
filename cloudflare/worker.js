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

async function callModel({ env, conversation, model }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: conversation,
      reasoning: { effort: env.REASONING_EFFORT || 'high' },
      temperature: 0.15,
      max_output_tokens: 420
    })
  });

  return response;
}

export default {
  async fetch(request, env) {
    const corsHeaders = buildCorsHeaders(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
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

      const safeHistory = Array.isArray(history)
        ? history
            .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
            .slice(-10)
        : [];

      const conversation = [
        { role: 'system', content: systemPrompt },
        ...safeHistory,
        {
          role: 'user',
          content: `Page context: ${pageContext?.path || 'unknown-path'} | ${pageContext?.title || 'unknown-title'}\nUser message: ${message}`
        }
      ];

      const primaryModel = env.OPENAI_MODEL || 'gpt-5';
      const fallbackModel = env.OPENAI_FALLBACK_MODEL || 'gpt-4.1-mini';

      let resp = await callModel({ env, conversation, model: primaryModel });

      if (!resp.ok && primaryModel !== fallbackModel) {
        resp = await callModel({ env, conversation, model: fallbackModel });
      }

      if (!resp.ok) {
        const detail = await resp.text();
        return new Response(JSON.stringify({ error: 'LLM upstream error', detail }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await resp.json();
      const text =
        data?.output_text ||
        'I can provide a practical Ontario-focused security recommendation for your site. Call 888-963-5633 or email info@pitbullsecuritysolutions.ca.';

      return new Response(JSON.stringify({ reply: text, focus, model: primaryModel }), {
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
