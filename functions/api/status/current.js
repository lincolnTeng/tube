export async function onRequest(context) {
    const hostResponse = await fetch('http://148.135.115.48:5000/api/status/current');
    const data = await hostResponse.json();
    
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
}
