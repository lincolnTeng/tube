export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url);
    const path = searchParams.get('path');
    
    const content = `
        <div class="page-content">
            <h1>${path}</h1>
            <p>Content for ${path}</p>
        </div>
    `;
    
    return new Response(content, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
}
