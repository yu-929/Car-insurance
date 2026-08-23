# User Instruction Memory

This file records user instructions, preferences, and teachings for reference in future interactions.

## Format

### User Instruction Entry
User instruction entries should follow this format:

[User Instruction Summary]
- Date: [YYYY-MM-DD]
- Context: [Mentioned scenario or time]
- Instructions:
  - [Content of user teaching or instruction, described line by line]

## Entries

[User Instruction Summary]
- Date: 2026-08-21
- Context: 新增附加备注与费率数据迭代时反复出现「把当前改动时间显示在页面右上角」的要求时
- Instructions:
  - 页面右上角固定展示「最后更新：YYYY-MM-DD HH:mm」。
  - 每次对 index.html 的内容或费率数据做任何更新，都要把这个时间改为更新发生时的当前时间。
  - 时间由开发时写死，不使用页面运行时获取的当前时间（运行时取当前时间会导致每次都变，失去「最后更新」语义）。
  - 右上角时间必须使用北京时间（开发环境系统时区为 Etc/UTC，更新时须先获取 UTC 时间再加 8 小时换算成北京时间）。

[User Instruction Summary]
- Date: 2026-08-21
- Context: 调整「小钱Car-insurance查询」查询结果备注时
- Instructions:
  - 每类业务对应的「非车」备注文案是固定不变的，不可被后续内容覆盖或替换。
  - 后续新增的备注内容均作为额外附加信息处理，与固定的非车备注并行展示。
  - 数据组织与展示时应把「固定的非车备注」与「额外的附加备注」分开维护。

[费率逻辑改动的回归验证方法]
- Date: 2026-08-23
- Context: Agent 在重构 getRateInfo 取值逻辑、接入费率上报 rateKey 时发现
- Category: Testing Methods|Troubleshooting & Debugging
- Instructions:
  - 凡改动 index.html 中费率取值或备注生成逻辑，必须先跑全量快照比对再提交。
  - 快照脚本 /tmp/opencode/snapshot_rates.js：用 jsdom 加载 index.html，穷举保司×城市×车型×业务类型×险种×过户×车驾意×优质车型×人员×承保条件（约 7.9 万组合），把 rate 与 note 写成文件，改动前后 diff 必须为 0 行。
  - jsdom 需从全局路径引入：require('/usr/local/lib/node_modules/jsdom')。
  - jsdom 环境缺少 scrollIntoView，加载后须打桩：w.Element.prototype.scrollIntoView = function () {}。
  - 回归脚本集中在 /tmp/opencode/，常用 verify_revert、verify_override、verify_jintai_note、bug_consistency、verify_ratekey_e2e。verify_instype.js 已失效（其断言的 updateInsuranceTypeOptions 在下拉重构中删除）。
  - 本地后端用 background terminal 跑 `node server.js`（端口 3001），接口联调完成后须把测试上报记录状态改为 rejected，避免污染查询结果。
