import OpenAI from "openai";
export async function handler(event, context) {
  try {
    const { text, context: ctx, model, gender } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let politeInstruction = "";
    if (gender === "male") {
      politeInstruction = "2. Polite (Male, ending with ครับ)";
    } else if (gender === "female") {
      politeInstruction = "2. Polite (Female, ending with ค่ะ)";
    } else {
      politeInstruction = "2. Polite (Male, ending with ครับ)\n3. Polite (Female, ending with ค่ะ)";
    }

    const prompt = `You are a Thai translation assistant.
Always respond ONLY with valid JSON, no extra text.
Translate the following English text into Thai in these styles:
1. Casual
${politeInstruction}
4. Formal (business/professional tone)
5. Playful/Flirtatious
English text: "${text}"
Context: "${ctx}"
For each style, return an object with:
- tone (string)
- thai (string)
- romanization (string)
- english (string, the English meaning of the Thai text)
- gender (male, female, or neutral)
- explanation (string)
Return as a JSON array.`;

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    let content = completion.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\[.*\]/s);
      if (match) {
        try { parsed = JSON.parse(match[0]); }
        catch { parsed = [{ tone:"Raw Output", thai: content, romanization:"", english:"", gender:"neutral", explanation:"Unparsed" }]; }
      } else {
        parsed = [{ tone:"Raw Output", thai: content, romanization:"", english:"", gender:"neutral", explanation:"Unparsed" }];
      }
    }

    // Ensure english field exists
    parsed = parsed.map(obj => ({
      ...obj,
      english: obj.english || text
    }));

    // Auto-fill gender if missing
    parsed = parsed.map(obj => {
      if (!obj.gender) {
        if (/Male/.test(obj.tone)) obj.gender = "male";
        else if (/Female/.test(obj.tone)) obj.gender = "female";
        else obj.gender = "neutral";
      }
      return obj;
    });

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}