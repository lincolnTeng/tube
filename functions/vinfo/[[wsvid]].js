// Cloudflare Pages Function: /functions/videoinfo.js

// Format ID mappings from cleanprofile
const FORMAT_IDS = {
    audio: ['140', '139'], // Primary audio preference: 140, fallback: 139
    '720p': ['136', '232', '298', '311', '398', '609', '612'],
    '1080p': ['137', '270', '299', '312', '399', '614', '616', '617'],
    '1440p': ['620', '623'],
    '2160p': ['625', '628']
};

export async function onRequest(context) {
    const { request, params } = context;
    const url = new URL(request.url);
    let [ws,videoId] = context.params.wsvid;

    if (!ws || !videoId) {
        return new Response(JSON.stringify({
            status: 'error',
            message: 'Missing ws or videoId parameter'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Fetch full video info from remote Flask server
        const response = await fetch(`http://pool.bayx.uk:5000/api/vinfo/${ws}/${videoId}`);
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
   


        
        const videoInfo = rawInfo.video_info;
        let basicInfo = {
            title: videoInfo.title,
            duration: videoInfo.duration, // In seconds
            view: videoInfo.view_count,
            like: videoInfo.like_count,
            desc: videoInfo. description ,
 
        };

        // Filter and map available formats
        const availableFormats = rawInfo.available_formats;
        let audioFormatId = null;
        const videoFormats = {
            '720p': null,
            '1080p': null,
            '1440p': null,
            '2160p': null
        };

        // Find audio format (140 preferred, 139 as fallback)
        for (const fmt of availableFormats) {
            if (!audioFormatId && FORMAT_IDS.audio.includes(fmt.format_id)) {
                audioFormatId = fmt.format_id;
                break; // Take the first match (140 if available, else 139)
            }
        }

        // Find video formats for each resolution
        for (const fmt of availableFormats) {
            for (const [res, ids] of Object.entries(FORMAT_IDS)) {
                if (res === 'audio') continue; // Skip audio entry
                if (!videoFormats[res] && ids.includes(fmt.format_id)) {
                    videoFormats[res] = fmt.format_id;
                }
            }
        }

        // Construct download options with combined format IDs
        const downloadOptions = [];
        if (audioFormatId) { // Only include options if audio is available
            for (const [res, videoFormatId] of Object.entries(videoFormats)) {
                if (videoFormatId) {
                    const combined = `c@${videoFormatId}+${audioFormatId}`;
                    downloadOptions.push({
                        resolution: res,
                        formatId: combined
                    });
                }
            }
        }
        

        // Construct the filtered response
        const filteredResponse = {
            status: 'success',
            video_info: basicInfo,
            download_options: downloadOptions
        };
        const stres = JSON.stringify(filteredResponse) ; 

        basicInfo.fmt = downloadOptions ; 
        basicInfo.ws = ws ; 
        await env.KVPROF.put( videoId, JSON.stringify(basicInfo));
        
        return new Response( stres , {
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
