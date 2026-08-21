export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const company = url.searchParams.get('company');
  const city = url.searchParams.get('city');
  const vehicleType = url.searchParams.get('vehicleType');
  const businessType = url.searchParams.get('businessType');
  const insuranceType = url.searchParams.get('insuranceType');
  
  if (!company || !city || !vehicleType || !businessType || !insuranceType) {
    return new Response(JSON.stringify({ error: '缺少查询参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const result = await env.DB.prepare(`
      SELECT new_rate, note FROM rate_reports 
      WHERE company = ? AND city = ? AND vehicle_type = ? 
        AND business_type = ? AND insurance_type = ? 
        AND status = 'approved'
      ORDER BY reported_at DESC 
      LIMIT 1
    `).bind(company, city, vehicleType, businessType, insuranceType).first();
    
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
