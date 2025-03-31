export async function onRequest(context) {
    const { request } = context;
    const body = await request.json();
    
    const hostResponse = await fetch('http://148.135.115.48:5000/api/task/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await hostResponse.json();
    
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
