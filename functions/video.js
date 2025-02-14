export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const videoId = searchParams.get('p');
    
    const content = `
        <div class="video-container">
            <iframe 
                src="https://www.youtube.com/embed/${videoId}"
                allowfullscreen>
            </iframe>
        </div>
    `;
    
    return new Response(content, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
}
