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

只有在源码冻结、已有镜像来源与独占部署经统一协调后，显式 `--run` 才连接 T312 已启动的原链。驱动只读取本地固定回环端口，拒绝代理/远端 Docker 覆盖，重核每个容器的所有者、镜像、运行状态、实际环境与内部网络。它不启动服务，不调用 stepPut，不生成执行结果，不创建另一调度器。

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
