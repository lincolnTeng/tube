// functions/api/llmsql/[[catchall]].js
import { dbService, r2Service } from './service.js';

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
                    return jsonResponse(await dbService.executeQuery(env.DB, body.sql));
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
