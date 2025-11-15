// functions/llmsql/[[catchall]].js (最终合并版)

// =================================================================
// 核心服务逻辑 (Service Logic)
// =================================================================

const dbService = {
    async getTableSets(db) {
        if (!db) throw new Error("D1 database binding (LLMSQL_DB) is missing or not configured.");
        const ps = db.prepare("SELECT DISTINCT tableset_name FROM _tableset_meta ORDER BY tableset_name");
        const { results } = await ps.all();
        return results.map(row => row.tableset_name);
    },
    async getTablesInSet(db, tablesetName) {
        if (!db) throw new Error("D1 database binding (LLMSQL_DB) is missing.");
        const ps = db.prepare("SELECT table_name FROM _tableset_meta WHERE tableset_name = ? ORDER BY table_name");
        const { results } = await ps.bind(tablesetName).all();
        return results.map(row => row.table_name);
    },
    async browseTable(db, tableName) {
        if (!db) throw new Error("D1 database binding (LLMSQL_DB) is missing.");
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) throw new Error("Invalid table name format.");
        const ps = db.prepare(`SELECT * FROM ${tableName} LIMIT 200`);
        const { results } = await ps.all();
        if (!results || results.length === 0) return { columns: [`No data in table '${tableName}'`], data: [] };
        const columns = Object.keys(results[0]);
        const data = results.map(row => Object.values(row));
        return { columns, data };
    },
    async executeQuery(db, sql) {
        if (!db) throw new Error("D1 database binding (LLMSQL_DB) is missing.");
        if (!sql.trim().toLowerCase().startsWith('select')) throw new Error("Security violation: Only SELECT queries are allowed.");
        const ps = db.prepare(sql);
        const { results } = await ps.all();
        if (!results || results.length === 0) return { columns: ["Query returned no results"], data: [] };
        const columns = Object.keys(results[0]);
        const data = results.map(row => Object.values(row));
        return { columns, data };
    }
};

const r2Service = {
    async listFiles(bucket) {
        if (!bucket) throw new Error("R2 bucket binding (LLMSQL_BUCKET) is missing.");
        const listed = await bucket.list();
        return listed.objects.map(obj => obj.key);
    },
    async uploadFile(bucket, fileName, fileData) {
        if (!bucket) throw new Error("R2 bucket binding (LLMSQL_BUCKET) is missing.");
        await bucket.put(fileName, fileData);
        return { success: true, fileName: fileName };
    },
        async getFilePreview(bucket, fileName, lines = 10) {
        if (!bucket) throw new Error("R2 bucket binding (LLMSQL_BUCKET) is missing.");
        const object = await bucket.get(fileName);
        if (!object) throw new Error(`File '${fileName}' not found in R2.`);
        const content = await object.text();
        return content.split('\n').slice(0, lines).join('\n');
    }
};

const llmService = {
    /**
     * 调用 Gemini API 分析文件样本并返回建议的 SQL Schema
     * @param {string} apiKey - Google Gemini API Key
     * @param {string} fileName - The name of the file being analyzed
     * @param {string} fileSample - A sample of the file's content
     * @returns {Promise<{tableName: string, sql: string}>}
     */
    async analyzeSchema(apiKey, fileName, fileSample) {
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured. Please set it as a secret.");
        }

        // 1. 构建 Prompt
        const prompt = `
You are an expert data engineer. Your task is to analyze a file sample and infer a suitable SQLite schema.

RULES:
1.  Analyze the provided file sample.
2.  Suggest a descriptive and valid SQL table name based on the file name. The name must be lowercase and use underscores (e.g., 'user_profiles').
3.  Infer the column names and their appropriate SQL data types. Use only TEXT, INTEGER, REAL, or BLOB.
4.  If an 'id' or similarly unique column exists, set it as the PRIMARY KEY.
5.  Your final output must be ONLY a single, raw JSON object.
6.  The JSON object must have this exact format: { "tableName": "...", "sql": "CREATE TABLE ..." }
7.  Do NOT include any extra text, explanations, or markdown formatting like \`\`\`json.

File Name: ${fileName}

File Sample:
---
${fileSample}
---

JSON Output:
`;

        // 2. 准备 API 请求
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            // Optional: Add safety settings if needed
            // safetySettings: [ ... ], 
            // generationConfig: { ... }
        };

        // 3. 发起 fetch 请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        // 4. 处理响应
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();

        // 5. 解析并返回结果
        try {
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Gemini API returned no candidates in the response.");
            }
            // 提取并清理 LLM 返回的文本
            let text = data.candidates[0].content.parts[0].text.trim();
            // 鲁棒性处理：移除 LLM 可能错误添加的 Markdown 代码块标记
            text = text.replace(/^```(json)?\s*|```$/g, '').trim();
            
            return JSON.parse(text);
        } catch (error) {
            console.error("Failed to parse LLM response. Raw text:", data.candidates[0].content.parts[0].text);
            throw new Error(`Could not parse a valid JSON response from the LLM. Error: ${error.message}`);
        }
    }
};


// =================================================================
// API 路由和请求处理 (Request Handler)
// =================================================================

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function jsonError(message, status = 500) {
    console.error(`[API Error] Status: ${status}, Message: ${message}`);
    return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequest(context) {
    const { request, env, params } = context;
    const pathParts = params.catchall || [];
    const command = pathParts[0];
    const arg = pathParts[1];
    const method = request.method;

    console.log(`[Request] ${method} /llmsql/${pathParts.join('/')}`);

    // 使用您指定的正确绑定名：env.LLMSQL_DB 和 env.LLMSQL_BUCKET
    const DB = env.LLMSQL_DB;
    const BUCKET = env.LLMSQL_BUCKET;

    if (!command && method === 'GET') return jsonResponse({ message: "Welcome API" });

    try {
        if (method === 'GET') {
            switch (command) {
                case 'tablesets': return jsonResponse(await dbService.getTableSets(DB));
                case 'tables':
                    if (!arg) return jsonError("Missing tableset name in URL", 400);
                    return jsonResponse(await dbService.getTablesInSet(DB, arg));
                case 'browse':
                    if (!arg) return jsonError("Missing table name in URL", 400);
                    return jsonResponse(await dbService.browseTable(DB, arg));
                case 'r2-files': return jsonResponse(await r2Service.listFiles(BUCKET));

                case 'file-preview':
                    if (!arg) return jsonError("Missing file name in URL", 400);
                    return jsonResponse({ preview: await r2Service.getFilePreview(BUCKET, arg) });
                    
                default: return jsonError(`Unknown GET command: '${command}'`, 404);
            }
        }

        if (method === 'POST') {
            switch (command) {
                case 'query':
                    const body = await request.json();
                    if (!body.sql) return jsonError("Missing 'sql' in body", 400);
                    return jsonResponse(await dbService.executeQuery(DB, body.sql));
                case 'upload-file':
                    const formData = await request.formData();
                    const file = formData.get('file');
                    if (!file) return jsonError("No file found in form data", 400);
                    const fileData = await file.arrayBuffer();
                    return jsonResponse(await r2Service.uploadFile(BUCKET, file.name, fileData));

                case 'analyze-file':
                    if (!body.fileName) return jsonError("Missing 'fileName' in body", 400);
                    // 获取更长的样本用于分析
                    const fileSample = await r2Service.getFilePreview(BUCKET, body.fileName, 20);
                    return jsonResponse(await llmService.analyzeSchema(GEMINI_API_KEY, body.fileName, fileSample));
                    
                default: return jsonError(`Unknown POST command: '${command}'`, 404);
            }
        }
        return jsonError(`Method ${method} not supported`, 405);
    } catch (e) {
        return jsonError(e.message, 500);
    }
}
