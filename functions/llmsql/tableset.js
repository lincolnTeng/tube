// functions/llmsql/tablesets.js
import { getTableSets } from './db.js';

export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const data = await getTableSets(env.DB);
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
