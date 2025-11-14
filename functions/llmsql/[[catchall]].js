
 const dbService = {
    async getTableSets(db) {
        if (!db) throw new Error("D1 database binding is missing or not configured.");
        const ps = db.prepare("SELECT DISTINCT tableset_name FROM _tableset_meta ORDER BY tableset_name");
        const { results } = await ps.all();
        return results.map(row => row.tableset_name);
    },
    async getTablesInSet(db, tablesetName) {
        if (!db) throw new Error("D1 database binding is missing.");
        const ps = db.prepare("SELECT table_name FROM _tableset_meta WHERE tableset_name = ? ORDER BY table_name");
        const { results } = await ps.bind(tablesetName).all();
        return results.map(row => row.table_name);
    },
    async browseTable(db, tableName) {
        if (!db) throw new Error("D1 database binding is missing.");
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            throw new Error("Invalid table name format. Only alphanumeric characters and underscores are allowed.");
        }
        const ps = db.prepare(`SELECT * FROM ${tableName} LIMIT 200`);
        const { results } = await ps.all();
        if (!results || results.length === 0) {
            return { columns: [`No data in table '${tableName}'`], data: [] };
        }
        const columns = Object.keys(results[0]);
        const data = results.map(row => Object.values(row));
        return { columns, data };
    },
    async executeQuery(db, sql) {
        if (!db) throw new Error("D1 database binding is missing.");
        if (!sql.trim().toLowerCase().startsWith('select')) {
            throw new Error("Security violation: Only SELECT queries are allowed.");
        }
        const ps = db.prepare(sql);
        const { results } = await ps.all();
        if (!results || results.length === 0) {
            return { columns: ["Query returned no results"], data: [] };
        }
        const columns = Object.keys(results[0]);
        const data = results.map(row => Object.values(row));
        return { columns, data };
    }
};

// =================================================================
// R2 (文件存储) 服务
// =================================================================
 const r2Service = {
    /**
     * 列出 Bucket 中的文件
     */
    async listFiles(bucket) {
        if (!bucket) throw new Error("R2 bucket binding is missing.");
        const listed = await bucket.list();
        return listed.objects.map(obj => obj.key);
    },
    
    /**
     * 上传文件到 R2
     */
    async uploadFile(bucket, fileName, fileData) {
        if (!bucket) throw new Error("R2 bucket binding is missing.");
        await bucket.put(fileName, fileData);
        return { success: true, fileName: fileName };
    }
}






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

    console.log(`[Request] ${method} /api/llmsql/${pathParts.join('/')}`);

    if (!command && method === 'GET') {
        return jsonResponse({ message: "Welcome API" });
    }

    try {
        if (method === 'GET') {
            switch (command) {
                case 'tablesets':
                    return jsonResponse(await dbService.getTableSets(env.LLMSQL_DB));
                case 'tables':
                    if (!arg) return jsonError("Missing tableset name in URL", 400);
                    return jsonResponse(await dbService.getTablesInSet(env.LLMSQL_DB, arg));
                case 'browse':
                    if (!arg) return jsonError("Missing table name in URL", 400);
                    return jsonResponse(await dbService.browseTable(env.LLMSQL_DB, arg));
                case 'r2-files':
                    return jsonResponse(await r2Service.listFiles(env.LLMSQL_BUCKET));
                default:
                    return jsonError(`Unknown GET command: '${command}'`, 404);
            }
        }

        if (method === 'POST') {
            switch (command) {
                case 'query':
                    const body = await request.json();
                    if (!body.sql) return jsonError("Missing 'sql' in body", 400);
                    return jsonResponse(await dbService.executeQuery(env.LLMSQL_DB, body.sql));
                case 'upload-file':
                    const formData = await request.formData();
                    const file = formData.get('file');
                    if (!file) return jsonError("No file found in form data", 400);
                    const fileData = await file.arrayBuffer();
                    return jsonResponse(await r2Service.uploadFile(env.LLMSQL_BUCKET, file.name, fileData));
                default:
                    return jsonError(`Unknown POST command: '${command}'`, 404);
            }
        }
        return jsonError(`Method ${method} not supported`, 405);
    } catch (e) {
        return jsonError(e.message, 500);
    }
}
