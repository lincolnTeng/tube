// /functions/auth/callback.js
// 处理Google回调
export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return new Response('认证失败', { status: 400 });
  }

  try {
    // 使用code获取access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.AUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    
    // 获取用户信息
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    
    const userData = await userResponse.json();
    
    // 生成应用自己的session token
    const sessionToken = crypto.randomUUID();
    
    // TODO: 在这里存储session信息到你的数据库
    // 比如用户ID、email等必要信息
    
    // 重定向回前端，带上session token
    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set('token', sessionToken);
    
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('认证失败', { status: 500 });
  }
}
