export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url).searchParams.get('url');
    
    // 假数据（调试用）
    const fakeData = {
        title: 'Sample Video',
        duration: '3:45'
    };
    
    // 模拟 fetch 远端逻辑（后续替换为真实 Host 地址）
    // const response = await fetch(`http://host:port/query?url=${encodeURIComponent(url)}`);
    // const data = await response.json();
    
    return new Response(JSON.stringify(fakeData), {
        headers: { 'Content-Type': 'application/json' }
    });
}
