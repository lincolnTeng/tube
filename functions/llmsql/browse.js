// functions/llmsql/browse.js
import { browseTable } from './db.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const tableName = body.tableName;

        if (!tableName) {
            return new Response("Missing tableName", { status: 400 });
        }

        const result = await browseTable(env.DB, tableName);
        
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
