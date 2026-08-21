export async function onRequestPost(context) {
  const { env } = context;
  
  try {
    const body = await context.request.json();
    const {
      company,
      city,
      vehicleType,
      businessType,
      insuranceType,
      oldRate,
      newRate,
      note
    } = body;

    if (!company || !city || !vehicleType || !businessType || !insuranceType || !newRate) {
      return new Response(JSON.stringify({ error: '缺少必填字段' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(`
      INSERT INTO rate_reports (company, city, vehicle_type, business_type, insurance_type, old_rate, new_rate, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(company, city, vehicleType, businessType, insuranceType, oldRate, newRate, note)
      .run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      message: '费率上报成功'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
