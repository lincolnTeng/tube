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
