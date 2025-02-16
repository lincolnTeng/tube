// /functions/auth/google-init.js
// 初始化Google登录流程
export async function onRequestGet({ env }) {
  // 生成状态令牌防止CSRF攻击
  const state = crypto.randomUUID();
  
  // 构建Google OAuth URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', env.AUTH_REDIRECT_URI);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'email profile');
  googleAuthUrl.searchParams.set('state', state);

  return Response.redirect(googleAuthUrl.toString(), 302);
}
