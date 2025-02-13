export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const videoIds = searchParams.get('path').split(',');
    
    const content = videoIds.map(id => `
        <div class="video-container">
            <iframe 
                src="https://www.youtube.com/embed/${id}"
                allowfullscreen>
            </iframe>
        </div>
    `).join('');
    
    return new Response(content, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
}
