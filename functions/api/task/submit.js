export async function onRequest(context) {
    const { request } = context;
    const { url } = await request.json();
    
    // 模拟 fetch 远端逻辑（调试用）
    // await fetch('http://host:port/submit', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ url })
    // });
    
    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
