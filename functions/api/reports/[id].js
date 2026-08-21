export async function onRequestGet(context) {
  const { env } = context;
  const id = context.params.id;
  
  try {
    const result = await env.DB.prepare('SELECT * FROM rate_reports WHERE id = ?').bind(id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: '记录不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  const { env } = context;
  const id = context.params.id;
  
  try {
    const body = await context.request.json();
    const { status } = body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({ error: '无效的状态' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await env.DB.prepare('UPDATE rate_reports SET status = ? WHERE id = ?')
      .bind(status, id)
      .run();
    
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: '记录不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true, message: '状态更新成功' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  const { env } = context;
  const id = context.params.id;
  
  try {
    const result = await env.DB.prepare('DELETE FROM rate_reports WHERE id = ?')
      .bind(id)
      .run();
    
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: '记录不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true, message: '删除成功' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
