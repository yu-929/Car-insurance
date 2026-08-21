-- 创建上报记录表
CREATE TABLE IF NOT EXISTS rate_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  business_type TEXT NOT NULL,
  insurance_type TEXT NOT NULL,
  old_rate TEXT,
  new_rate TEXT NOT NULL,
  note TEXT,
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
