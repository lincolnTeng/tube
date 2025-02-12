export async function handleRequest(request) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get('id'); // 假设文件 ID 在 URL 中用 ?id= 参数传递

  // 从 R2 获取文件
  const r2 = getR2Bucket();
  const object = await r2.get(fileId);

  if (!object) {
    return new Response('File not found', { status: 404 });
  }

  // 设置响应头，指示浏览器下载文件
  const headers = new Headers();
  headers.set('Content-Type', object.contentType);
  headers.set('Content-Disposition', `attachment; filename="${fileId}.mp4"`); // 假设文件为 mp4

  // 返回文件数据
  return new Response(object.body, { headers });
}
