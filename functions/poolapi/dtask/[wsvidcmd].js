// Cloudflare Pages Function: /functions/videoinfo.js

// Format ID mappings from cleanprofile
 
export async function onRequest(context) {
    const { request, params } = context;
    const url = new URL(request.url);
    let cmdstring  = context.params.wsvidcmd;

    if (!cmdstring ) {
        return new Response(JSON.stringify({
            status: 'error',
            message: 'cmdstring error '
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Fetch full video info from remote Flask server
        const response = await fetch(`http://pool.bayx.uk:5000/api/dtask/${cmdstring }`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video info: ${response.statusText}`);
        }
        const rawInfo = await response.json();

        if (rawInfo.status === 'error') {
            return new Response(JSON.stringify(rawInfo), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Extract basic video info
    
        return new Response(JSON.stringify(rawInfo), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            status: 'error',
            message: `Server error: ${error.message}`
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
