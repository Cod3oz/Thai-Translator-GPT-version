import OpenAI from "openai";
export async function handler(event, context) {
  try {
    const { text, context: ctx, model, gender } = JSON.parse(event.body);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let politeInstruction="";
    if(gender==="male"){politeInstruction="2. Polite (Male, ending with ครับ)";}
    else if(gender==="female"){politeInstruction="2. Polite (Female, ending with ค่ะ)";}
    else{politeInstruction="2. Polite (Male, ending with ครับ)\n3. Polite (Female, ending with ค่ะ)";}
    const prompt=`You are a Thai translation assistant. Always respond ONLY with valid JSON.
Translate the following English text into Thai in these styles:
1. Casual
${politeInstruction}
4. Formal
5. Playful/Flirtatious
English text: "${text}"
Context: "${ctx}"
Return JSON array of objects: tone, thai, romanization, english, gender, explanation.`;
    const completion=await openai.chat.completions.create({
      model:model||"gpt-4o-mini",messages:[{role:"user",content:prompt}],temperature:0.7
    });
    let content=completion.choices[0].message.content;let parsed;
    try{parsed=JSON.parse(content);}catch{const match=content.match(/\[.*\]/s);if(match){try{parsed=JSON.parse(match[0]);}catch{parsed=[{tone:"Raw",thai:content,romanization:"",english:"",gender:"neutral",explanation:"Unparsed"}];}}else{parsed=[{tone:"Raw",thai:content,romanization:"",english:"",gender:"neutral",explanation:"Unparsed"}];}}
    parsed=parsed.map(o=>({...o,english:o.english||text}));
    parsed=parsed.map(o=>{if(!o.gender){if(/Male/.test(o.tone))o.gender="male";else if(/Female/.test(o.tone))o.gender="female";else o.gender="neutral";}return o;});
    return{statusCode:200,body:JSON.stringify(parsed)};
  }catch(err){return{statusCode:500,body:JSON.stringify({error:err.message})};}
}