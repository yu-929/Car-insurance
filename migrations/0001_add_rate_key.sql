-- 为 rate_reports 增加 rate_key 列
--
-- rate_key 是费率取值路径（由前端 resolveRatePath 生成），唯一标识费率表中的一格。
-- 加入此列前，上报按「保司+城市+车型+业务类型+险种」五要素匹配，粒度不足：
-- 锦泰的车驾意/人员/优质车型维度、燕赵的承保条件维度都不在五要素内，
-- 一次上报会同时覆盖这些维度下的所有格子。
--
-- schema.sql 中的 CREATE TABLE IF NOT EXISTS 不会为已存在的表补列，
-- 因此已部署的 D1 数据库必须执行本迁移：
--   npx wrangler d1 execute car-insurance-db --remote --file=./migrations/0001_add_rate_key.sql
--
-- 存量记录的 rate_key 保持 NULL，latest-note 接口对 NULL 记录仍按五要素回退匹配，
-- 因此无需回填即可继续生效。

ALTER TABLE rate_reports ADD COLUMN rate_key TEXT;

CREATE INDEX IF NOT EXISTS idx_rate_reports_lookup
  ON rate_reports (rate_key, status, reported_at);
