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
- Date: 2026-09-21
- Context: Agent 在核验燕赵费率改动时重新验证（原记录日期 2026-08-23）
- Category: Testing Methods|Troubleshooting & Debugging|Environment Configuration
- Instructions:
  - 凡改动 index.html 中费率取值或备注生成逻辑，必须先跑全量快照比对再提交。
  - jsdom 在新会话中未预装，需先 `npm install -g jsdom`，再从全局路径引入：require('/usr/local/lib/node_modules/jsdom')。
  - 回归脚本集中在 /tmp/opencode/，但该目录内容不跨会话保留；verify_revert、verify_override、verify_jintai_note、bug_consistency、verify_ratekey_e2e 等脚本需要时按下方要点重写。verify_instype.js 已失效（其断言的 updateInsuranceTypeOptions 在下拉重构中删除）。
  - 加载 index.html 时 url 必须用 'file:///workspace/index.html'，否则外部脚本 rates.js 无法加载，rates 为空、费率全部返回「暂无数据」。
  - jsdom 环境缺少 scrollIntoView，加载后须打桩：w.Element.prototype.scrollIntoView = function () {}。
  - rates 是脚本作用域的 const，不挂在 window 上，w.rates 为 undefined；需用 w.eval('...') 在页面上下文内取值。
  - getRateInfo(company, city, businessType, insuranceType, vehicleType, isTransfer, hasCarAccident, isPremiumVehicle, hasPersonnel, underwritingCondition, rideInsurance) 的 insuranceType 必须传单险种名（'单交强'/'单商业'/'交商共保'），传 'all' 会返回「暂无数据」；返回值是 { rate, note, rateKey }，rate 为单个字符串。
  - 核验燕赵费率时承保条件必须显式传入 '常规车型'/'非常规车型' 两次，两个层都要覆盖。
  - 改完一个城市的费率后，必须同时打印其余城市同车型的值做对照，确认未误伤（燕赵各城费率高度雷同，盲替换极易串格）。
  - 替换燕赵数据块时用正则定位「车型键 + 常规车型子块 + 非常规车型子块」整体并断言旧值出现次数为 2，比按行文本替换安全。
  - 本地后端用 background terminal 跑 `node server.js`（端口 3001），接口联调完成后须把测试上报记录状态改为 rejected，避免污染查询结果。
