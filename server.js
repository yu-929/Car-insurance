const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 初始化数据库
const db = new Database(path.join(__dirname, 'rates.db'));

// 创建上报记录表
db.exec(`
  CREATE TABLE IF NOT EXISTS rate_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    city TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    business_type TEXT NOT NULL,
    insurance_type TEXT NOT NULL,
    rate_key TEXT,
    old_rate TEXT,
    new_rate TEXT NOT NULL,
    note TEXT,
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending'
  )
`);

// 为早于 rate_key 的库补列，保持新旧库结构一致
const hasRateKey = db.prepare("PRAGMA table_info(rate_reports)").all()
  .some((col) => col.name === 'rate_key');
if (!hasRateKey) {
  db.exec('ALTER TABLE rate_reports ADD COLUMN rate_key TEXT');
}

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_rate_reports_lookup
    ON rate_reports (rate_key, status, reported_at)
`);

// 上报费率接口
app.post('/api/report-rate', (req, res) => {
  try {
    const {
      company,
      city,
      vehicleType,
      businessType,
      insuranceType,
      rateKey,
      oldRate,
      newRate,
      note
    } = req.body;

    if (!company || !city || !vehicleType || !businessType || !insuranceType || !newRate) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const stmt = db.prepare(`
      INSERT INTO rate_reports (company, city, vehicle_type, business_type, insurance_type, rate_key, old_rate, new_rate, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(company, city, vehicleType, businessType, insuranceType, rateKey || null, oldRate, newRate, note);

    res.json({
      success: true,
      id: result.lastInsertRowid,
      message: '费率上报成功'
    });
  } catch (error) {
    console.error('上报失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 查询已审核通过的最新费率与备注
// 优先按 rate_key 精确匹配到费率表中的一格；
// 没有 rate_key 命中时回退到五要素匹配，兼容早期上报记录
app.get('/api/latest-note', (req, res) => {
  const { company, city, vehicleType, businessType, insuranceType, rateKey } = req.query;

  if (!company || !city || !vehicleType || !businessType || !insuranceType) {
    return res.status(400).json({ error: '缺少查询参数' });
  }

  try {
    let row;
    if (rateKey) {
      row = db.prepare(`
        SELECT new_rate, note FROM rate_reports
        WHERE rate_key = ? AND status = 'approved'
        ORDER BY reported_at DESC
        LIMIT 1
      `).get(rateKey);
    }

    if (!row) {
      row = db.prepare(`
        SELECT new_rate, note FROM rate_reports
        WHERE company = ? AND city = ? AND vehicle_type = ?
          AND business_type = ? AND insurance_type = ?
          AND rate_key IS NULL
          AND status = 'approved'
        ORDER BY reported_at DESC
        LIMIT 1
      `).get(company, city, vehicleType, businessType, insuranceType);
    }

    res.json(row || {});
  } catch (error) {
    console.error('查询失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取上报记录接口
app.get('/api/reports', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM rate_reports ORDER BY reported_at DESC');
    const reports = stmt.all();
    res.json(reports);
  } catch (error) {
    console.error('查询失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取单条上报记录
app.get('/api/reports/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM rate_reports WHERE id = ?');
    const report = stmt.get(req.params.id);

    if (!report) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json(report);
  } catch (error) {
    console.error('查询失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新上报状态
app.put('/api/reports/:id', (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const stmt = db.prepare('UPDATE rate_reports SET status = ? WHERE id = ?');
    const result = stmt.run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json({ success: true, message: '状态更新成功' });
  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 删除上报记录
app.delete('/api/reports/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM rate_reports WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
