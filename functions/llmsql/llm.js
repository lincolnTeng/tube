// functions/llmsql/llm.js

function buildPrompt(task, context) {
    switch (task) {
        case 'generate-sql':
            return `
You are a SQL expert for SQLite.
Schema: ${context.schema}
Question: "${context.question}"
Rules: Output ONLY a single valid SQL SELECT statement. No markdown.
`;

        case 'analyze-schema':
            return `
You are a data engineer. Analyze this file sample to create a SQLite table.
File Name: ${context.fileName}
Sample Data:
${context.fileSample}

Rules:
1. Suggest a table name (lowercase, underscores).
2. Infer column names and types (TEXT, INTEGER, REAL).
3. Output JSON ONLY with this format: { "tableName": "...", "sql": "CREATE TABLE ..." }
4. No markdown.
`;
        default:
            throw new Error(`Unknown task: ${task}`);
    }
}

export async function invokeLLM(apiKey="somekey", task, context) {
  
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
   //// apiKey = "AIzaSyANt1u2jvWUgTVOVezTVnf1gIaxH8_x_xg";
  
    const prompt = buildPrompt(task, context);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await response.json();
    try {
        let text = data.candidates[0].content.parts[0].text.trim();
        // 清理可能存在的 Markdown 代码块标记
        text = text.replace(/^```(json|sql)?/g, '').replace(/```$/g, '').trim();
        
        if (task === 'analyze-schema') {
            return JSON.parse(text);
        }
        return text;
    } catch (e) {
        throw new Error("Failed to parse LLM response");
    }
}
