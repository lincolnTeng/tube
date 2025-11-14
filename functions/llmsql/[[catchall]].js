// functions/llmsql/[[catchall]].js (最终修复版)
import { dbService } from './service.js';

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

    // --- 新增的检查：处理对根路径 /llmsql 的访问 ---
    if (!command && method === 'GET') {
        return jsonResponse({
            message: "Welcome to the LLM SQL Tool API.",
            available_commands: [
                "GET /llmsql/tablesets",
                "GET /llmsql/tables/{tablesetName}",
                "GET /llmsql/browse/{tableName}",
                "POST /llmsql/query"
            ]
        });
    }
    // --- 检查结束 ---

    try {
        if (method === 'GET') {
            switch (command) {
                case 'tablesets':
                    return jsonResponse(await dbService.getTableSets(env.DB));
                
                case 'tables':
                    if (!arg) return jsonError("Missing tableset name in URL (e.g., /llmsql/tables/my_tableset)", 400);
                    return jsonResponse(await dbService.getTablesInSet(env.DB, arg));

                case 'browse':
                    if (!arg) return jsonError("Missing table name in URL (e.g., /llmsql/browse/my_table)", 400);
                    return jsonResponse(await dbService.browseTable(env.DB, arg));
                
                default:
                    return jsonError(`Unknown GET command: '${command}'`, 404);
            }
        }

        if (method === 'POST') {
            const body = await request.json();
            switch (command) {
                case 'query':
                    if (!body.sql) return jsonError("Missing 'sql' property in request body", 400);
                    return jsonResponse(await dbService.executeQuery(env.DB, body.sql));

                default:
                    return jsonError(`Unknown POST command: '${command}'`, 404);
            }
        }

        return jsonError(`Method ${method} not supported for this route.`, 405);
    } catch (e) {
        return jsonError(e.message, 500);
    }
}
