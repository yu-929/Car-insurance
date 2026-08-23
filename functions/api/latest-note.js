export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const company = url.searchParams.get('company');
  const city = url.searchParams.get('city');
  const vehicleType = url.searchParams.get('vehicleType');
  const businessType = url.searchParams.get('businessType');
  const insuranceType = url.searchParams.get('insuranceType');
  const rateKey = url.searchParams.get('rateKey');

  if (!company || !city || !vehicleType || !businessType || !insuranceType) {
    return new Response(JSON.stringify({ error: '缺少查询参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 优先按 rate_key 精确匹配到费率表中的一格
    let result = null;
    if (rateKey) {
      result = await env.DB.prepare(`
        SELECT new_rate, note FROM rate_reports
        WHERE rate_key = ? AND status = 'approved'
        ORDER BY reported_at DESC
        LIMIT 1
      `).bind(rateKey).first();
    }

    // 回退到五要素匹配，兼容早期没有 rate_key 的上报记录
    if (!result) {
      result = await env.DB.prepare(`
        SELECT new_rate, note FROM rate_reports
        WHERE company = ? AND city = ? AND vehicle_type = ?
          AND business_type = ? AND insurance_type = ?
          AND rate_key IS NULL
          AND status = 'approved'
        ORDER BY reported_at DESC
        LIMIT 1
      `).bind(company, city, vehicleType, businessType, insuranceType).first();
    }

    return new Response(JSON.stringify(result || {}), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
