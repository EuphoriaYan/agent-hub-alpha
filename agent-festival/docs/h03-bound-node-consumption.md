# H03：从选用图到实际字段消费

本批按当前 #30/#35 接线适配 #31 执行绑定、#32 锁外发现和 #33 场景/能力选择，保留其原职责。#34 跨任务知识复用不是本批前置，也未在新 profile 开启。输入、能力、方案和正式结果分别处理：

| 流程 | 输入 → 输出 | 原所有者 |
| --- | --- | --- |
| 场景构建 | 可信参考请求与能力 → 新 Agent 包及独立接收证据 | 原 Builder Host/TaskStore |
| 能力组图 | 业务查询、场景包及能力合同 → 选用记录与候选 Plan | 原 Hub 选择器、组图与采纳 |
| 任务运行 | 固定 Plan、材料及正式上游结果 → 正式节点产物 | 原 Java 调度器、Runtime/Bus、Begin/Commit |
| 评测与改进 | 输出及固定评测条件 → 报告、获批子代及复评 | 原评测/监督端口；本批未接 H04/H05 |

不能把构建出的包当成协作图，也不能把节点完成当作业务质量或生产准入。完整私有边界见 [节点合同](contracts/hub-node-binding-v1.md)。

## 当前有限实现

`two-role-identity/v1` 在原 eligible 阶段排除错误单位/类型/期间/口径，保留 unknown 和全部分母；原排序与图生成继续决定方案。采纳固定完整快照及必要执行配置。两个独立工程角色经原 Runtime/Bus 消费结构化输入，原 CommitCall 持久提交，原页面展示选用理由、数据来源与提交状态。

工程参考为 component_a=40、component_b=60、reference=95：第一节点生成 total=100，第二节点消费正式上游并得到 difference=5。本轮已实际验证该原链及另一冻结材料变体 41/60/95 的 101/6。它们是明确合成数据，不是年报业务答案或自然模型优化。

## 可复现运行边界

部署与受控验收入口位于 [deploy/h03](../go/cmd/credit-demo/deploy/h03/README.md)。只用已批准来源与锁定依赖、操作者固定镜像及临时凭据；不继承旧全量 compose 或真实模型/银行配置，不自动构建、拉取或起额外服务。默认只检查，明确操作才启动自有资源。

必须分别保存：原选择/采纳及摘要；实际原 Run/Call/Task 身份；实际输入与正式输出的安全证据；字段变体传播；原 Runtime/角色权限、持久失败、未知不重派和必需节点门禁；实际页面；出站观察与 owned cleanup。编译和 plain-main 探针不代替原生联合运行，解析 compose 不代替服务可用。

原 WorkSwarm 项要求原宿主、已安装插件及真实任务后端；模拟 RPC 的浏览器回归仅是组件验证。缺原宿主或观测就保留 BLOCKED/NOT_RUN，不能换壳或把缺测写成零调用。

W01 已有 verified 答案候选；独立性签收、真实年报专业角色和共享环境仍是后续业务验收条件。工程、业务、D2、生产权限及发布状态分别留证，不从本候选推定完成。

关闭新准入可回滚，原命令/Call/Plan/Run 和 UNKNOWN 历史保留供有权核对；不通过删除状态、新浏览器键或新实例恢复发送资格。

## 本轮实际工程交接（2026-11-17）

已实际验证原 MCP select/propose→原登录与确认页批准→原 Java Worker/Runtime/Bus→两个独立角色→正式 Step/Graph committed：baseline09 得到 100/5，changed10 得到 101/6。两组使用各自固定 Plan/材料快照与独立 Task/context，每角色各一次 SendMessage；下游正式输入引用上游已提交产物，原 InputDigest、ArtifactDigest、采纳闭包与原 Go 图投影一致。变体只在 prepare 前将材料 component_a40→41 并更新必要材料/场景/profile pin，保存前后字节 SHA；没有热改已采纳配置。

另一次明确负例在 SendMessage 超时后进入 UNKNOWN；原租约关闭后重启同一个 owned credit 容器、保留原数据，重建 MCP/登录会话并 Resume 同一 Run。Call 身份、摘要、UNKNOWN 状态及发送次数 1 均保持。原基线完成的 Run 在 QA 读取修复后仅只读复验，没有重新派发补成绩。两个自有项目均经原 owned cleanup 停止，数据卷及 UNKNOWN/失败历史保留。

运行 Go 源码固定 `e09f71e3d9973fb44fd15fa54ca7bc95ff5e992c`，Linux binary SHA256 为 `032bfa1d14a609d4b6c576db0e0f48c71727a906a0ca8e445fee988dd2188b72`；QA reader 固定 `9f6365a2311d8d167e5d62517ec028c17365bfe0`，只对齐持久 StepRec 的原 `remote_call` 字段，不改 HTTP Begin 的 `call` 或运行字节。Java 沿用 `fe14af28d51296a48ecea4bdfe791054f1b4c670` 装配来源，九个模块源码逐项复核未变。SourceImage、原 base/output image、binary/JAR 与材料 before/after 摘要分别留证；原 runtime base 的 artifact refresh 不等于完整 Dockerfile 或全 Maven 重跑。

固定 localhost CLI 本轮仍为 BLOCKED：Docker internal 网络虽声明回环绑定，容器实际 `NetworkSettings.Ports["8091/tcp"]` 为 null。成功结果使用已批准的可信本机操作员 API：先调用原 `deployed(project, root, receipts)` 完成 source/config/container 审计，再只从返回的 owned credit 容器取其唯一内部网络 IP，核 owner/project/service/image 与 IPAM 子网，仅设置该原 `Client` 实例的 `base`；随后调用原 initialize/login/propose/approve、wait_state/formal_receipt/graph_receipt、unknown_check 和 compare 函数。可复核前置与逐步入口见[部署工具的实际交接](../go/cmd/credit-demo/deploy/h03/README.md#本轮实际交接2026-11-17)。这不是 CLI 或原 WorkSwarm 浏览器通过，也不引入 proxy、新 runner、远端地址入口或门禁豁免；不能访问已审计 owned bridge IP 时仍 BLOCKED。

本轮原 Go Run 页引用及 Graph committed 投影已有实际证据；原 WorkSwarm 宿主/真实任务后台的浏览器观察仍 BLOCKED。独立外部 egress、实际角色模型/银行请求计数及有效租约内重复 Commit/持久化失败窗口仍 BLOCKED/NOT_RUN。完成后 Commit409 只证明关闭租约 fence；框架 model_events=0 不能代替外发观测。合成工程主链通过不等同年报 Gold、业务 D2、生产 IAM、发布或合入批准。
