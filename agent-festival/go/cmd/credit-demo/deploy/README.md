# Issue #16 构建与部署入口

本目录先复现 W02 的授信尽调原型，用于验证 WorkSwarm → Go → Java 的部署和接口。
原型来源为 [WangHaowen99/agent-hub-alpha @ 46980e8](https://github.com/WangHaowen99/agent-hub-alpha/tree/46980e84bf12e9a0fbfa860614822509bf299db5)，仅引入 `credit-demo`、`credit-orchestrator` 和必需的部署补丁，未合并整个 fork。

**这不是已完成的 #16 年报 Demo。** 当前专业成员仍在 Java 进程内创建，未接 RDC/Gateway；业务数据为授信模拟材料；确认采用演示账号；完整年报核验、模型调用计数和 A01—A15 仍需集成验证。#6 是可选增强，不参与启动依赖。

下一步按 [Issue 16 Agent Bus 接入执行计划](../../../../docs/issue16-agent-bus-execution-plan.md) 推进：先接通远程 `report-writer`，再扩展三角色及故障验证。预计 5–7 人日，实施与验收均待执行；年报角色业务逻辑由 W06 提供。

## 本机验证记录（2026-11-11）

| 检查 | 结果 |
| --- | --- |
| Go / Java / WorkSwarm 三个镜像构建 | 通过；`build-all.json` 保存实际镜像 ID |
| Go 单元测试、`go vet`、图卡源码构建 | 通过 |
| Go / Java 健康检查、图编译与摘要稳定性、非法依赖拒绝 | 通过 |
| MCP 能力目录、Go → Java 候选图创建 | 通过；本次生成待批准计划 `P1`，未触发执行 |
| WorkSwarm 已安装包、前端资源、启动命令与 MCP App 方法 | 禁用网络的镜像检查通过 |
| WorkSwarm Web、专家入口与模型连通 | 已启动；页面识别 `deepseek-flash`，容器内模型请求成功 |
| 真实对话 → MCP → 候选图卡片 | 通过；DeepSeek 生成 `P2 v1`，7 个节点，预检通过且保持待批准 |
| 完整业务执行与年报场景验收 | 尚未完成 |

证据见缓存目录 `evidence/build-all.json`、`core-smoke.json`、`workswarm-image-smoke.json`、`experience-smoke.json`。`core-smoke.json` 与 `workswarm-image-smoke.json` 中的零模型调用仅描述对应脚本行为；体验检查使用真实模型，不作为 #16 的调用计数验收证据。

## 构建

在仓库根目录执行（Linux x86_64，Docker/Compose、Git、Python 3、uv 0.11.7）：

```sh
python3 agent-festival/go/cmd/credit-demo/deploy/demo.py build all
```

也可将 `all` 换成 `go`、`java`、`ui`，逐个构建。构建不会启动业务服务或调用模型。

- `sources.lock.json` 固定原型、WorkSwarm 和 agent-solution 提交；Go 工具链校验 SHA-256。
- Java Core 0.1.17 从 Maven Central 获取，orchestration / react-rails 0.1.3 从固定 solution 源码构建，不使用作者机器的 `kbs-m2`。
- WorkSwarm 沿用自身 `package-lock.json` 和 `uv.lock`；暂以 W02 原型的 `1142e5fb3` 为复现基线。切换 #16 引用的 `b98ec8c7d` 需独立验证，不默认视为兼容。
- 该版本的协议依赖位于 GitCode MR #391；构建只将获取引用改为该 MR，`uv.lock` 最终检出的 `4c5f3e9` 提交保持不变。使用 `uv sync --frozen` 保留上游依赖覆盖规则。
- 基础镜像使用 `python:3.11-slim`、`node:22-slim` 和 `nginx:alpine`，实际构建镜像 ID 写入证据。Java 构建与运行使用 Debian OpenJDK 21，编译目标仍为 Java 17。
- WorkSwarm 前端构建默认允许 Node 使用 3 GiB 堆；首次下载和编译依赖耗时较长，后续复用 Docker 构建缓存。
- 下载与源码缓存位于 `~/.cache/agent-hub-alpha/issue16`，可用 `DEMO_CACHE` 指定另一目录。缓存源有改动时拒绝覆盖。
- 构建继承当前 `HTTP_PROXY` / `HTTPS_PROXY`，Maven 在构建步骤内生成并删除临时代理配置；不修改 Docker 守护进程或本机其他服务。

## 配置模型并启动

可直接使用当前 shell 中的 `SWARM_API_BASE`、`SWARM_API_KEY`、`SWARM_MODEL_NAME` 和 `SWARM_ENDPOINT_PROFILE`。如果没有这组显式配置、也没有配置文件，启动脚本会复用 `DEEPSEEK_API_KEY`，并读取 `COEVOSKILLS_DEEPSEEK_BASE_URL` / `COEVOSKILLS_DEEPSEEK_MODEL`（也支持 `DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL`），自动选择 `deepseek` 协议配置。密钥只传入运行时，不写入仓库或镜像。

也可将 `secrets.env.example` 复制到仓库外，例如 `~/.config/aha-swarm/secrets.env`，填写模型地址、密钥和模型名。文件权限设为 `600`，不要提交真实配置。

```sh
# 使用文件时设置；已有环境变量时省略此行。
export AHA_SECRETS_FILE=/absolute/path/to/secrets.env
python3 agent-festival/go/cmd/credit-demo/deploy/demo.py start
python3 agent-festival/go/cmd/credit-demo/deploy/demo.py status
```

入口：`http://localhost:5192`。若首次出现模型配置引导，已有配置时点“跳过”。依次进入“专家 → 我的专家 → 授信编排助手”的详情页，点击“使用”。
对话示例：为客户 C006 做授信尽调，使用权限范围内的征信摘要，先给出候选图，等待我批准。
演示确认账号为 `alice`；密码由 `CREDIT_DEMO_PASSWORD` 配置。

默认仅绑定回环地址；端口可用 `CREDIT_SWARM_PORT` / `CREDIT_PORT` 调整，允许来源随前端端口一致变化。模型密钥通过运行时配置注入，不进入镜像。Compose 中未提供配置时允许构建，完整启动前会检查各服务实际解析出的模型配置并拒绝缺失值；不要求必须有配置文件。WorkSwarm 自身会将运行配置写入受保护的数据卷文件。

## 无模型的接口验证

```sh
python3 agent-festival/go/cmd/credit-demo/deploy/demo.py start core
python3 agent-festival/go/cmd/credit-demo/deploy/smoke.py
python3 agent-festival/go/cmd/credit-demo/deploy/smoke_image.py
```

只启动 Go 与 Java，验证健康检查、真实编排模块的图编译、无效依赖拒绝及 MCP 能力目录，并通过 `propose_plan` 创建一张待批准候选图，验证 Go → Java 编译接口。不会批准业务任务或调用模型；通过结果不能替代端到端演示验收。

`smoke_image.py` 单独在禁用网络的临时容器中检查 WorkSwarm 的已安装包、前端资源与 MCP App 协议方法；不等同于界面及模型联调。

## 停止与状态

```sh
python3 agent-festival/go/cmd/credit-demo/deploy/demo.py stop
```

只停止 `agent-hub-issue16` 项目，保留命名数据卷。构建记录与验证证据写在缓存目录的 `evidence/` 下。

后续集成顺序以 [Agent Bus 接入执行计划](../../../../docs/issue16-agent-bus-execution-plan.md) 为准：先以现有成员完成真实总线链路，再接入 W06 三角色并验证恢复和故障处理。年报材料、指标口径、报告核验及最终验收按 #16 的其他工作包推进。
