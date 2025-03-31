export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', ''); // 提取 /api/ 后的路径
    const hostUrl = `http://148.135.115.48:5000/api/${path}${url.search}`; // 构造 host.py 的 URL

    try {
        const hostResponse = await fetch(hostUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method === 'POST' ? await request.text() : null
        });

        if (!hostResponse.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch from host: ${hostResponse.statusText}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await hostResponse.json();
        return new Response(JSON.stringify(data), {
            status: hostResponse.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
