export async function onRequest(context) {
    // 假数据（调试用）
    const fakeWaiting = [
        { id: 1, url: 'https://youtube.com/sample1' },
        { id: 2, url: 'https://youtube.com/sample2' }
    ];
    
    // 模拟 fetch 远端逻辑
    // const response = await fetch('http://host:port/queue/waiting');
    // const data = await response.json();
    
    return new Response(JSON.stringify(fakeWaiting), {
        headers: { 'Content-Type': 'application/json' }
    });
}
