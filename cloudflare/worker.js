export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

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
      const { message, history = [] } = await request.json();
      if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const systemPrompt = `You are Pitbull Security Solutions Ltd.'s website assistant.
Business facts you may state:
- Company: Pitbull Security Solutions Ltd.
- Phone: 888-963-5633
- Email: info@pitbullsecuritysolutions.ca
- Address: 925 Isaac Phillips Way, Newmarket, ON L3X 0M7
- Service areas: Newmarket, Aurora, Richmond Hill, East Gwillimbury, Bradford, Georgina/Keswick, Vaughan.
- Core services: access control, card access, camera systems, alarm systems, intercom/door entry, structured low-voltage wiring, smart automation, live monitoring.

Rules:
1) Focus only on Pitbull services and local service areas.
2) Never invent certifications, legal guarantees, or monitoring partnerships.
3) For pricing questions: explain pricing depends on project scope and offer consultation.
4) If user asks legal/compliance questions, recommend speaking to a licensed professional and Pitbull team directly.
5) If unsure, ask one clarifying question then offer escalation.
6) When user asks for a human / urgent / complex help, escalate immediately with phone + email.
7) Keep responses concise, clear, and sales-supportive.`;

      const conversation = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-8),
        { role: 'user', content: message }
      ];

      const resp = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-4.1-mini',
          input: conversation,
          temperature: 0.2
        })
      });

      if (!resp.ok) {
        const detail = await resp.text();
        return new Response(JSON.stringify({ error: 'LLM upstream error', detail }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await resp.json();
      const text = data?.output_text || 'I can help with services, coverage areas, and consultation steps. Please call 888-963-5633 for immediate assistance.';

      return new Response(JSON.stringify({ reply: text }), {
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
