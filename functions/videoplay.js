export async function handleRequest(request) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get('id'); // 假设视频 ID 在 URL 中用 ?id= 参数传递

  // 从 R2 获取视频文件
  const r2 = getR2Bucket();
  const object = await r2.get(videoId);

  if (!object) {
    return new Response('Video not found', { status: 404 });
  }

  // 设置响应头
  const headers = new Headers();
  headers.set('Content-Type', object.contentType);
  headers.set('Content-Length', object.size);

  // 返回视频数据
  return new Response(object.body, { headers });
}
