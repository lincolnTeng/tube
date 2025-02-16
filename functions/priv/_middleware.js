// /functions/private/_middleware.js
export async function onRequest({ request, next, env }) {
  const sessionToken = request.headers.get('Authorization')?.split('Bearer ')[1];
  
  if (!sessionToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // TODO: 从你的数据库验证session token
    // 验证成功后添加用户信息到请求对象
    request.user = { /* 用户基本信息 */ };
    return next();
  } catch (error) {
    return new Response('认证失败', { status: 401 });
  }
}
