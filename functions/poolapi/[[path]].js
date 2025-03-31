export async function onRequest(context) {
    const { request, params } = context;
    const url = new URL(request.url);

    // 使用 params.path 捕获动态路径
    // params.path 是一个数组，包含所有路径段
    const pathSegments = params.path || []; // 如果没有路径段，返回空数组
    const path = pathSegments.join('/'); // 将路径段拼接为字符串，例如 ["task", "query"] -> "task/query"

    // 构造 host.py 的目标 URL
    const hostUrl = `http://pool.bayx.uk:5000/api/${path}${url.search}`;

    try {
        const hostResponse = await fetch(hostUrl, {
            method: request.method,
            headers: request.headers,
            body: request.method === 'POST' ? await request.text() : null
        });

        if (!hostResponse.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch from host: ${hostResponse.statusText} hosturl: ${hostUrl} ` }), {
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
