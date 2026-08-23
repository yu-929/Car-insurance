-- 为 rate_reports 增加 rate_key 列
--
-- 状态：已于 2026-08-23 在生产 D1（car-insurance-db）执行完毕，无需重复运行。
--
-- rate_key 是费率取值路径（由前端 resolveRatePath 生成），唯一标识费率表中的一格。
-- 加入此列前，上报按「保司+城市+车型+业务类型+险种」五要素匹配，粒度不足：
-- 锦泰的车驾意/人员/优质车型维度、燕赵的承保条件维度都不在五要素内，
-- 一次上报会同时覆盖这些维度下的所有格子。
--
-- 适用对象：仅在 rate_key 列之前建好的旧库需要执行本文件。
-- schema.sql 已包含 rate_key，用它新建的库不要再跑本迁移
-- （ALTER TABLE ADD COLUMN 无 IF NOT EXISTS，重复执行会报 duplicate column name）。
--
-- 执行方式（择一）：
--   Dashboard: D1 -> car-insurance-db -> Console 粘贴下方语句
--   命令行:    npx wrangler d1 execute car-insurance-db --remote --file=./db/0001_add_rate_key.sql
--
-- 存量记录的 rate_key 保持 NULL，latest-note 接口对 NULL 记录仍按五要素回退匹配，
-- 因此无需回填即可继续生效。

ALTER TABLE rate_reports ADD COLUMN rate_key TEXT;

CREATE INDEX IF NOT EXISTS idx_rate_reports_lookup
  ON rate_reports (rate_key, status, reported_at);

ALTER TABLE rate_reports ADD COLUMN rate_key TEXT;

CREATE INDEX IF NOT EXISTS idx_rate_reports_lookup
  ON rate_reports (rate_key, status, reported_at);
