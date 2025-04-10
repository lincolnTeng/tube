export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url).searchParams.get('url');
    
    const hostResponse = await fetch(`http://148.135.115.48:5000/api/task/query?url=${encodeURIComponent(url)}`);
    const data = await hostResponse.json();
    
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
