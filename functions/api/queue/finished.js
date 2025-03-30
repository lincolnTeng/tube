export async function onRequest(context) {
    // 假数据（调试用）
    const fakeFinished = [
        { id: 3, title: 'Sample Video 1', downloadLink: '/downloads/sample1.mp4' },
        { id: 4, title: 'Sample Video 2', downloadLink: '/downloads/sample2.mp4' }
    ];
    
    // 模拟 fetch 远端逻辑
    // const response = await fetch('http://host:port/queue/finished');
    // const data = await response.json();
    
    return new Response(JSON.stringify(fakeFinished), {
        headers: { 'Content-Type': 'application/json' }
    });
}
