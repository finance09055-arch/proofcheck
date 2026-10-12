const ALLOWED_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const key = Netlify.env.get("GEMINI_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: 'Server API key is missing.' }), { status: 500 });
  }

  try {
    const body = await req.json();
    
    const { model, prompt, mime, data, withThinking = true } = body;
    if (!ALLOWED_MODELS.includes(model)) {
      return new Response(JSON.stringify({ error: 'Bad request.' }), { status: 400 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: data } }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          maxOutputTokens: 3072,
          ...(withThinking ? { thinkingConfig: { thinkingLevel: 'low' } } : {})
        }
      })
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: response.status, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
