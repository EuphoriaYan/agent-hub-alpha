# H03 独立工程验证工具

本目录只配置受控的两个工程角色：`eng.sum@0.1.0` 消费固定材料并生成 total/reference，`eng.reconcile@0.1.0` 消费前者产物并计算 difference。固定示例为 40+60=100、100-95=5，不代表年报 Gold、D2 或生产能力。材料、ScenarioPackage 与私有 profile 的 SHA 分别固定；profile 的宿主路径不进入语义摘要。

`--help` 与 `config` 均不启动服务。`start` 才会显式启动；调用者必须在当前已批准任务的本地工作根下建立独占输出目录，协调同一台 Docker 主机的单一操作者。此处不构建、不拉取镜像、不继承现有容器、数据库、银行或模型环境，也不安装新依赖。

## 预备现有镜像

先依原部署构建路径产生本次源码对应的镜像和收据，再提供本地操作员 JSON 清单。所有镜像值必须是本机已有的完整 `sha256:<64 hex>` 镜像 ID。`source_lock_sha256` 是 `deploy/sources.lock.json` 原始字节 SHA256；清单中恰好列所选服务，禁止可变 tag。示意结构（占位内容须替换）：

```json
{
  "schema_version": "h03-local-images/v1",
  "source_lock_sha256": "<64 hex>",
  "images": {
    "credit": "sha256:<64 hex>",
    "orchestrator": "sha256:<64 hex>",
    "engineering-sum": "sha256:<64 hex>",
    "engineering-reconcile": "sha256:<64 hex>",
    "bus-db": "sha256:<64 hex>",
    "rdc": "sha256:<64 hex>",
    "gateway": "sha256:<64 hex>"
  }
}
```

清单是本地构建收据的入口，不能仅因填写了源码锁摘要就宣称镜像确由该源码构建。真实源码/镜像闭包由后续原生验证核实。`--ui original` 额外要求 `swarm`、`front` 镜像及 `ui` 收据：`host_source_revision` 必须等于锁文件的 WorkSwarm commit，`model_free` 必须为 true，`plugin_sha256` 是四个原插件文件路径→文件 SHA256 映射按排序紧凑 UTF-8 JSON 编码后的 SHA256。缺原宿主、插件生成物或无模型运行前提即 BLOCKED；不以模拟页面代替宿主验证。

## 配置、显式启动与清理

在 Linux/WSL 的现有本机 Docker 默认 context 下运行，替换占位路径；先阅读帮助：

```bash
python3 launch_h03.py --help
python3 launch_h03.py config --project h03-owned-example --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/config-only --images <private-images.json>
python3 launch_h03.py start --project h03-owned-run --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/run --images <private-images.json>
python3 launch_h03.py stop --project h03-owned-run --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/run
```

每次 config/start 必须使用新的输出目录，默认只选七个 core 服务；原宿主 UI 须显式 `--ui original`。工具保存未展开的 compose、材料/profile/场景只读副本、源码锁关联和镜像 ID；检查原始模板、Compose 展开配置以及启动后实际容器的环境、挂载、网络、权限与所有者。生成的运行身份和数据库等凭据只写本地 `private-local.json`，不得提交、打印或附到公开报告。`configuration-audit.json` 只含环境键名，不含秘密值；不要公开完整 Compose config 或 Docker inspect 输出。

所有服务使用新建内部网络、新数据卷、独立名称和所有者标记。Go 与 Runtime 共享独立运行凭据，角色容器没有该凭据。仅 credit 的 18191 端口及可选原 UI 的 18192 端口绑定回环地址。受控 RDC 配置的无签名卡例外仅限该独立网段；它不是生产身份方案。`SWARM_*` 环境变量即使为空也拒绝，Docker/Compose 外部配置覆盖拒绝；镜像中未知环境变量、非原入口、外部/宿主网络均拒绝。

`stop` 只处理本目录记录对应的项目、镜像及所有者，保留数据卷和 Task/UNKNOWN 历史，不重派或删除未决执行。启动后审计失败会返回 BLOCKED；操作员须依据原有 ownership 记录检查并调用同一 stop 命令，不得把失败当成成功再启动另一组服务。内部网络配置本身不是出站实测证据；真实双角色消费、Begin/Commit、错误路径、出站观察、原 UI 消费和复现属于 T313，工具不会自动签收。

## 无依赖 Java plain-main probe

两个 probe 类须由对应 Java Task 提供。本 runner 只接受以下精确组合：

| module | probe |
| --- | --- |
| `examples/credit-orchestrator` | `com.openjiuwen.demo.credit.H03BindingProbe` |
| `examples/professional-agent-runtime` | `com.openjiuwen.demo.professional.H03EngineeringProbe` |

```bash
python3 run_java_probe.py --help
python3 run_java_probe.py --module examples/credit-orchestrator --probe com.openjiuwen.demo.credit.H03BindingProbe --maven-cache <existing-maven-cache> --build-image sha256:<existing-build-image-id> --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/orchestrator-probe
```

runner 复制现有模块和现有 Maven cache 到独占输出目录，记录文件 SHA，使用 `mvn -o`，运行精确 plain-main 类，要求明确 `H03_PROBE_PASS` 标记。镜像模式必须使用 Linux 本机已有的不可变构建镜像，以 `--network none`、只读根文件系统、无 capabilities 和私有临时目录运行；不会调用应用 Main、启动 Bus/业务服务或下载依赖。宿主模式要求已安装 Java/Maven，且仅是 plain-main probe，不提供网络隔离证明。缺缓存、工具、probe 类或断言回执均 BLOCKED。probe PASS 仅表示局部断言通过，真实 Runtime 验收仍为 NOT_RUN。

## 本地自测

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s . -p test_launch_h03.py -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s . -p test_run_java_probe.py -v
```

上述测试全部使用 mock Docker/Maven，不启动服务。实际 Compose parser 检查必须另行记录并明确 synthetic 镜像 fixture 与真实镜像审计的区别。禁止将历史 native 报告或 parser/probe 的局部 PASS 写成当前 H03 原生成功。

## T313 原链验证驱动

`verify_h03.py` 默认仅准备本地证据清单；与计划所列命令一致，不会隐式启动 Docker 或连接服务：

```bash
python3 verify_h03.py --project h03-engineering --scenario engineering-two-role --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/prepared
```

只有在源码冻结、已有镜像来源与独占部署经统一协调后，显式 `--run` 才连接 T312 已启动的原链。CLI 使用本地固定回环端口，拒绝代理/远端 Docker 覆盖，重核每个容器的所有者、镜像、运行状态、实际环境与内部网络。它不启动服务，不调用 stepPut，不生成执行结果，不创建另一调度器。本轮该固定端口未兑现，CLI 原生结果为 BLOCKED；下述已验证操作员 API 路径须单独记录。

```bash
python3 verify_h03.py --run --project h03-owned-run --deployment-root <existing-T312-owned-root> --image-receipts <fixed-native-image-receipts.json> --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/baseline
```

镜像来源清单须使用真实原件，格式为 `{"schema_version":"h03-native-image-receipts/v1","images":{"credit":{"image_id":"sha256:...","receipt":"relative-build-receipt.json","receipt_sha256":"raw-file-sha256","source_manifest":"relative-source-manifest.json","source_manifest_sha256":"raw-file-sha256"}}}`。images 恰含所选七或九个服务，image_id 必须等于 T312 ownership 的固定镜像 ID。原件路径限定在当前 HUB-NEXT/evidence 内；清单做原件摘要及镜像关联一致性检查，不代替独立来源审查。不得伪造 build/test/来源 PASS 来填清单。

驱动通过原 MCP initialize/select_capabilities/propose_plan，检查完整两角色选择与预检，再走原 `/ui/login` 登录和原确认页表单批准。原 Java Worker 自动领取并执行原 Runtime/Bus 调用。驱动只通过自有 credit 容器的固定 `/bin/cat /data/state.json` 读取私有状态，在内存解析；该运行工具缺失即 BLOCKED。原 `/debug/state` 不作取证出口：受控 profile 的实际外层 handler 返回 404 静态正文，不泄露私有状态。build/history 的内层 403/no-store 是另一条门禁，由其独立测试覆盖。

报告只保存允许的正式输入/输出字节、原 InputDigest（包含模型与 goal 的原式、尾 NUL）、合同/闭包摘要、原 Task/context、产物摘要及原调用记录计数。租约 token、节点 capability token、密码、Runtime 身份不落入报告。两个独立角色必须分别形成原 Task 和 context，正式下游依赖必须引用上游已提交产物。原 `/api/graph` 的 committed 消费状态与同 Run 确认页引用也必须一致。

`--case baseline` 要求固定材料 40/60/95，结果 100/5；`--case changed` 要求另一个独占部署的已批准固定材料 41/60/95，结果 101/6。不得热改原已采纳快照、借换 ID 绕过 UNKNOWN 或把旧结果当新结果。两次实际运行后可离线比较：

```bash
python3 verify_h03.py --project h03-comparison --compare-baseline <baseline-verification.json> --compare-changed <changed-verification.json> --output-dir <H>/.specify/feature/HUB-NEXT/evidence/native/comparison
```

正常链之后，`--unknown` 可另做显式故障负例：暂停本次自有 gateway，等待原 SendMessage 超时、原 Run waiting 且原租约已由 Done 清空，finally 恢复 gateway。随后严格核对 credit 容器所有者与固定镜像，实际 restart 同一容器（保留原 DataDir/数据卷），检查容器 StartedAt 已改变，等原控制服务恢复，重新建立原 MCP session 和登录 session，再恢复同一 Run。重启前后及 Resume 后的同一 Call 身份和发送记录数必须保持，且不创建新 Plan/Task 来绕过 UNKNOWN。该项目保留未决历史，不代做外部结果签收；暂停/重启窗口必须由同一原生操作者协调。驱动仅在此明确选项下重启现有自有 credit 容器，不执行 up/start 或新建部署。

工具自身的错误批准、period/basis 排除、exec/model/member/debug 拒绝和完成后 Commit fencing 负例与正常业务分开记录。原 Done 会清空租约，所以完成后重复 Commit 应为 409；这不证明有效租约内幂等或字段校验。有效租约内重复 Commit、慢 RDC、持久化失败等独立原生故障窗口仍需后续实际证据。

此驱动当前只判定原工程链与 Go 页面投影；真实 WorkSwarm 宿主/任务后台/选中任务的浏览器观察、独立出站连接与拒绝计数、实际 Handler 模型和银行请求计数均须另外取证。缺前置保持 BLOCKED，正常原链可继续分项；框架 ModelEvents=0 不等于实际出站计数=0，Go 确认页不代替原 WorkSwarm 页面。整体报告不会仅凭本工具把 T313、Gold、D2 或生产标成 PASS。

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s . -p test_verify_h03.py -v
```

这些自测均用合成状态与 mock 传输验证驱动边界，不是原生运行证据。

## 本轮实际交接（2026-11-17）

本轮已实际走通原 MCP 选择/提案→原登录与确认页批准→原 Java Worker/Runtime/Bus→两个独立角色→正式 Step 提交。独占 baseline09 的 P1/R1 得到 total=100、difference=5；独占 changed10 的 P1/R1 得到 101、6。两组各自有两个不同 Task/context，每个角色各一次 SendMessage；正式输入、上游产物引用、原 InputDigest/ArtifactDigest 和原 Go Graph 的 committed 投影均通过校对，离线比较确认材料变化传播到采纳/输入/产物摘要。

baseline09 另一次明确故障负例 R2 在原 SendMessage 超时后进入 UNKNOWN。原租约清空后，实际重启同一 owned credit 容器、保留数据卷、重建 MCP/登录会话，再 Resume 同一 R2；原 Call 身份与摘要保持、仍 UNKNOWN、发送数保持 1。基线已完成 R1 在 QA reader 修复后仅只读复验，未重新派发补成绩。两个项目最后均经原 owned stop 停止，保留数据卷、原 Run/Task/UNKNOWN 和早期失败证据。

| 本轮消费来源 | 固定版本或摘要 | 解释 |
| --- | --- | --- |
| Go 运行源码 | `e09f71e3d9973fb44fd15fa54ca7bc95ff5e992c` | Linux binary SHA256 `032bfa1d14a609d4b6c576db0e0f48c71727a906a0ca8e445fee988dd2188b72` |
| credit 运行镜像 | `sha256:3b2d2056ee0d3d0910c5a84d5df4a8acbe5f0b1ec8b6014b0224521d3fd5e096` | 固定原 runtime base 上刷新已验证 binary，未宣称完整重跑原 Dockerfile |
| QA reader 源码 | `9f6365a2311d8d167e5d62517ec028c17365bfe0` | 持久 StepRec 使用原 `remote_call` tag；HTTP Begin 的 `call` 不变。修复后 16 个 stdlib 测试通过，不替换已运行 Go/Java 字节 |
| Java 装配来源 | `fe14af28d51296a48ecea4bdfe791054f1b4c670` | 九个模块源码文件复核未变；orchestrator JAR SHA256 `0b947bced7f698fc1266436a5ba876f70e7d3ea7e4fd846c5ee37cef3dc1c9ed`，professional JAR SHA256 `177c51d33499d9e9fd40a42a4dcf9202645b748ea5aee0e1532a0c36e3787a89`。沿用其实际离线 Maven/probe 回执，镜像刷新未重跑全 Maven |

Bus 运行依赖另绑定本轮 T405 的原 source closure `27bb09f7dfae5057b2573a4c021ce47ce37f25309ef01eacda048b21c61090bd` 与实际 build/test 收据，不能把可变 tag 或历史测试当作本轮来源。交接记录分别封存 SourceImage/binary/JAR 的前后 SHA、原 base image ID、输出 image ID 和材料派生摘要；后续仅文档提交不会改变这些已验证运行来源。

### 可信本机操作员 API 前置与步骤

本轮 Docker internal 网络的 credit 容器虽声明回环 PortBindings，实际 `NetworkSettings.Ports["8091/tcp"]` 为 null，固定 `127.0.0.1:18191` 不可用。成功的工程结果来自已批准的本机操作员 API：仅将原 `Client` 实例的 `base` 配置为严格审计后的 owned bridge IP，仍调用以下原函数链。它不是 CLI 原生成功，也不是可接受任意 URL 的新增入口。

1. 冻结源码、binary/JAR 与本机不可变镜像及来源收据；由单一操作者使用原 `launch.prepare(project, ui, output, images_path, *, here=HERE, festival=FESTIVAL)` 和 `launch.start(prepared)` 建立新 owned 部署。先完成 raw/resolved/actual 环境、挂载、网络、用户与镜像审计；不得改已 prepare 的 ownership/config 或运行中镜像。
2. 调用 `deployed(project, root, receipts)`，重核原 source receipts、配置/材料摘要及全部容器。只对返回的 `deployment["containers"]["credit"]` 做本机 inspect；重核 ID、固定 image、owner/service/project 标签及唯一 `<project>_h03` 网络，取该网络的 IP，并验证它在已审计 expected IPAM 子网内。缺一项就 BLOCKED；不要打印完整 inspect、私有 env 或 state。
3. 构造原 `client = Client()`，仅此实例设置 `client.base = "http://" + owned_ip + ":8091"`。记录安全的容器/镜像身份及地址来源；不修改 `Client` 类、不 monkeypatch 审计或模板 pin、不加 proxy/echo/新 runner、不停用门禁、不修改网络路由。
4. 调用 `client.initialize()`、`client.login(password)`；密码仅从本次 deployment 的私有配置在内存读取。调用 `planning_negatives(client)`，再 `plan, selection = propose(client)`；原函数通过 MCP 执行 select/propose。调用 `client.approve(plan)`，由原登录 cookie 和确认表单取得 Run ID；Java Worker 自动领取，操作员不写 Step 或伪造结果。
5. 用 `wait_state(deployment, run_id, {"done"}, timeout)`、`formal_receipt(state, run_id, expected_a)`、`graph_receipt(client.graph(run_id), formal)` 逐项校对；再核原 `/ui/run/<run_id>` 引用。`native_negatives(deployment, client, state, run_id)` 的拒绝探测单独计时记录。若只是 QA reader 修正，读取同一个已存在 Run，禁止再次 propose/approve 补成绩。
6. changed 使用另一独占目录，在 prepare 前由可信操作员派生固定材料：仅 component_a 的原字节 40→41，更新其实际材料 SHA、场景引用及 profile 的材料/场景摘要；其它字节保留，记录 before/after SHA。通过 prepare 的原 `here` 参数消费该固定目录，不声称 CLI 自动生成 changed 材料。使用同一函数链实际执行后，以 `compare(baseline, changed)` 比较安全回执。
7. UNKNOWN 是另一个显式故障负例，调用原 `unknown_check(deployment, client, password, timeout)`；只对本次 owned gateway/credit 操作。它会产生一次负例提案/Run，重启后必须恢复同一 Run，不能重建任务绕 UNKNOWN。完成后调用原 `launch.stop(project, output)` 保留卷和未决历史。不得为了重现本轮成绩重新运行已完成的项目。

以上 API 步骤需要本机能直接访问已审计的 owned bridge IP；不具备该前置就 BLOCKED，不改共享网络或退回未审计地址。安全交接证据包含两组正式回执、比较、UNKNOWN restart、派生材料和镜像来源冻结；秘密只留原私有部署目录。

工程主链通过后仍有明确缺项：原 WorkSwarm 宿主/插件/真实任务后台的浏览器验收、独立外部 egress/模型/银行计数、有效租约内 Commit 幂等及持久化故障窗口仍 BLOCKED/NOT_RUN。完成后 Commit 的 409 只证明原关闭租约 fence；框架 model_events=0 不证明外发为零。本轮合成材料结果不构成年报 Gold、业务 D2、生产 IAM 或发布准入。详见[整体消费交接](../../../../../docs/h03-bound-node-consumption.md)。
