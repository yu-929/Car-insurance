export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const result = await env.DB.prepare('SELECT * FROM rate_reports ORDER BY reported_at DESC').all();
    
    return new Response(JSON.stringify(result.results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
