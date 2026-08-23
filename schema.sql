-- 创建上报记录表
CREATE TABLE IF NOT EXISTS rate_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  business_type TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  -- 费率取值路径，由前端 resolveRatePath 生成，唯一标识费率表中的一格
  -- 历史记录可能为 NULL，此时按五要素粗粒度匹配
  rate_key TEXT,
  old_rate TEXT,
  new_rate TEXT NOT NULL,
  note TEXT,
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_rate_reports_lookup
  ON rate_reports (rate_key, status, reported_at);

