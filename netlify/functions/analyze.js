const ALLOWED = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const key = Netlify.env.get('GEMINI_API_KEY');
  if (!key) return Response.json({ error: { message: 'Server API key is missing.' } }, { status: 500 });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: { message: 'Bad request.' } }, { status: 400 }); }

  const { model, prompt, mime, b64, withThinking = true } = body;
  if (!ALLOWED.includes(model) || !prompt || !mime || !b64)
    return Response.json({ error: { message: 'Bad request.' } }, { status: 400 });

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: b64 } }] }],
      generationConfig: {
        temperature: 0.1, responseMimeType: 'application/json', maxOutputTokens: 3072,
        ...(withThinking ? { thinkingConfig: { thinkingLevel: 'low' } } : {})
      }
    })
  });

  return new Response(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
};