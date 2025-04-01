import ytdl from 'ytdl-core';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const info = await ytdl.getInfo(videoUrl);
  const response = {
    title: info.videoDetails.title,
    formats: info.formats,
  };
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
