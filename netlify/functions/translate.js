import OpenAI from "openai";

export async function handler(event, context) {
  try {
    const { text, context: ctx, model } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a Thai translation assistant.
Translate the following English text into Thai in 5 styles:
1. Casual
2. Polite (Male, ending with ครับ)
3. Polite (Female, ending with ค่ะ)
4. Formal (business/professional tone)
5. Playful/Flirtatious

English text: "${text}"
Context: "${ctx}"

For each style, return a JSON object with:
- tone
- thai
- romanization (Latin phonetics)
- explanation (short English note)

Return as a JSON array.`;

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    let content = completion.choices[0].message.content;
    let parsed;
    try { parsed = JSON.parse(content); }
    catch { parsed = [{ tone: "Raw Output", thai: content, romanization: "", explanation: "Could not parse JSON strictly" }]; }

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}