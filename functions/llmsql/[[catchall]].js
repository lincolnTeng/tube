// functions/llmsql/[[catchall]].js
import { dbService } from './service.js';
// import { r2Service, llmService } from './service.js'; // 预留给未来的扩展

// 辅助函数：创建统一的 JSON 响应
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

// 辅助函数：创建统一的 JSON 错误响应
function jsonError(message, status = 500) {
    console.error(`[API Error] Status: ${status}, Message: ${message}`);
    return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

// Cloudflare Functions 主处理函数
export async function onRequest(context) {
    const { request, env, params } = context;
    const pathParts = params.catchall || [];
    const command = pathParts[0];
    const arg = pathParts[1];
    const method = request.method;

    console.log(`[Request] ${method} /llmsql/${pathParts.join('/')}`);

    try {
        // --- GET 请求路由 ---
        if (method === 'GET') {
            switch (command) {
                case 'tablesets':
                    const tablesets = await dbService.getTableSets(env.DB);
                    return jsonResponse(tablesets);
                
                case 'tables':
                    if (!arg) return jsonError("Missing tableset name in URL (e.g., /llmsql/tables/my_tableset)", 400);
                    const tables = await dbService.getTablesInSet(env.DB, arg);
                    return jsonResponse(tables);

                case 'browse':
                    if (!arg) return jsonError("Missing table name in URL (e.g., /llmsql/browse/my_table)", 400);
                    const tableData = await dbService.browseTable(env.DB, arg);
                    return jsonResponse(tableData);
                
                // 预留给未来的 GET 端点
                // case 'r2-files':
                //     const files = await r2Service.listFiles(env.LLMSQL_BUCKET);
                //     return jsonResponse(files);

                default:
                    return jsonError(`Unknown GET command: '${command}'`, 404);
            }
        }

        // --- POST 请求路由 ---
        if (method === 'POST') {
            const body = await request.json();
            switch (command) {
                case 'query':
                    if (!body.sql) return jsonError("Missing 'sql' property in request body", 400);
                    const queryResult = await dbService.executeQuery(env.DB, body.sql);
                    return jsonResponse(queryResult);

                // 预留给未来的 POST 端点
                // case 'generate-sql':
                //     // ... handle logic ...
                //     break;
                // case 'import':
                //     // ... handle logic ...
                //     break;

                default:
                    return jsonError(`Unknown POST command: '${command}'`, 404);
            }
        }

        return jsonError(`Method ${method} not supported for this route.`, 405);

    } catch (e) {
        // 捕获所有来自 service 层或路由内部的异常
        return jsonError(e.message, 500);
    }
}
