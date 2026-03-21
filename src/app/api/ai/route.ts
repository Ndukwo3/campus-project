import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      // For MVP, if key is missing, return a mock response to not break UI
      return NextResponse.json({ 
        response: "I'm your Academic Assistant! (Note: GEMINI_API_KEY is currently missing in the environment variables, so I'm giving a placeholder response). I can help you with study schedules, summarizing textbooks, and explaining complex concepts. Once my API key is configured, I'll be fully active!"
      });
    }

    // Call Gemini API (simplified)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful Nigerian university Academic Assistant. Answer the following question or help with the task: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again.";

    return NextResponse.json({ response: aiText });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
