export async function onRequest(context) {
    // 假数据（调试用）
    const fakeStatus = {
        task: {
            title: 'Sample Video Download',
            progress: 50,
            status: 'Downloading'
        }
    };
    
    // 模拟 fetch 远端逻辑
    // const response = await fetch('http://host:port/status/current');
    // const data = await response.json();
    
    return new Response(JSON.stringify(fakeStatus), {
        headers: { 'Content-Type': 'application/json' }
    });
}
