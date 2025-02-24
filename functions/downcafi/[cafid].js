export async function onRequest(context) {
  
  let videoKey = context.param.cafid ; 
  let bucket = context.env.bucket;
  try {
    const obj = await bucket.get(videoKey);
    if (!obj) {
      return new Response('Video not found', { status: 404 });
    }

    // Get the range header if it exists
    const range = obj.range;
    const headers = new Headers();

    // Set content type and other necessary headers
    headers.set('Content-Type', 'video/mp4');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Cache-Control', 'public, max-age=3600');

    if (range) {
      headers.set('Content-Range', `bytes ${range.offset}-${range.end}/${obj.size}`);
      headers.set('Content-Length', range.length);
      return new Response(obj.body, {
        status: 206,
        headers
      });
    }

    headers.set('Content-Length', obj.size);
    return new Response(obj.body, {
      headers
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
 
      
}


 
