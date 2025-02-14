export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const videoId = searchParams.get('p');
    
    const content = `        path to ${videoId}     `;
    
    return new Response(content, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
}
