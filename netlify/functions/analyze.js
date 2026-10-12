import { GoogleGenAI } from "@google/genai";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const apiKey = Netlify.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server API key is missing" }), { status: 500 });
  }

  try {
    const body = await req.json();
    const { prompt, mime, data, thinking } = body;

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = {
      inlineData: {
        data: data,
        mimeType: mime,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt, imagePart],
    });

    return new Response(JSON.stringify({ result: response.text }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
