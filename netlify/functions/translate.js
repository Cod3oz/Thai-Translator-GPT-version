import OpenAI from "openai";
export async function handler(event, context) {
  try {
    const { text, context: ctx, model, gender } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt=`You are a Thai translation assistant. Always respond ONLY with valid JSON.
Translate the following English text into Thai in these styles, writing as a ${gender} speaker with appropriate particles and tone in all cases:
1. Casual
2. Polite
3. Formal
4. Playful
5. Flirtatious
English text: "${text}"
Context: "${ctx}"
Return JSON array of objects with: tone, thai, romanization, english, gender, explanation.`;
    const completion=await openai.chat.completions.create({
      model:model||"gpt-4o-mini",messages:[{role:"user",content:prompt}],temperature:0.7
    });
    let content=completion.choices[0].message.content;let parsed;
    try{parsed=JSON.parse(content);}catch{const match=content.match(/\[.*\]/s);if(match){try{parsed=JSON.parse(match[0]);}catch{parsed=[{tone:"Raw",thai:content,romanization:"",english:"",gender,explanation:"Unparsed"}];}}else{parsed=[{tone:"Raw",thai:content,romanization:"",english:"",gender,explanation:"Unparsed"}];}}
    parsed=parsed.map(o=>({...o,english:o.english||text,gender:o.gender||gender}));
    return{statusCode:200,body:JSON.stringify(parsed)};
  }catch(err){return{statusCode:500,body:JSON.stringify({error:err.message})};}
}