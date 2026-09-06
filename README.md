# dsh-mcp-skill-manager

DeepSeek Harness (DSH) Web 插件：在输入框右侧（模型选择器左侧）添加管理入口，直观展示并即时开关当前会话的项目级与全局级 MCP 和 Skills，支持点击卡片直接在操作系统文件管理器中打开对应目录。

---

## ✨ 功能特性

- 🎯 **聊天框无缝集成**：挂载于聊天输入框右侧工具栏（`conversation.input.right`），紧邻模型选择器，随用随开。
- ⚡ **即时生效的开关控制**：
  - **Skills 开关**：开启时位于 `skills` 目录，关闭时即时移入同级 `skills-disable` 目录，避开 DSH 检索规则，无需重启即刻启停。
  - **MCP 开关**：直接读取并修改 `~/.dsh/cordis.patch.yml` 中的配置，添加或移除 `disabled: true` 属性。
- 📂 **点击直接打开对应文件夹**：
  - 点击列表中的任意 Skill，直接唤起系统默认文件管理器（macOS Finder / Windows 资源管理器 / Linux 文件管理器）打开该技能目录或所在文件夹。
  - 点击任意 MCP 项，直接在文件管理器中打开其配置文件所在目录（`~/.dsh`）。
  - 开关按钮带有防冒泡机制，切换状态不会误触打开文件夹。
- 🔍 **分类与关键词检索**：支持按关键字即时过滤，并支持按全部 / Skills / MCP 分类筛选。
- 📐 **与官方交互一致的 Popover 气泡**：贴合输入框自动计算弹出位置（上浮/下沉），无遮罩阻塞，支持点击外部区域或按下 `Esc` 键自动收起。
- 层次清晰：严格优先展示**当前项目（Project）**资源，再展示**全局（Global）**资源。

---

## 📦 安装指南

### 方式一：从 GitHub / npm 直接安装

如果无需修改源码，可以直接使用 DSH CLI 一键安装：

```bash
# 从 GitHub 仓库安装
dsh plugin --profile web add github:abdecd/dsh-mcp-skill-manager
```

重启 DSH Web 即可生效：

```bash
dsh web
```

---

### 方式二：本地克隆与开发安装（推荐）

如果你克隆了本仓库，直接在项目根目录下即可通过 `dsh plugin` 一键链接安装：

```bash
# 1. 克隆本仓库
git clone https://github.com/<your-username>/dsh-mcp-skill-manager.git
cd dsh-mcp-skill-manager

# 2. 安装依赖并编译构建
pnpm install
pnpm run build

# 3. 链接安装至 DSH Web Profile（推荐使用 link:. 保持本地热更新）
dsh plugin --profile web add link:.
```

安装后启动或重启 DSH 服务即可：

```bash
dsh web
```

---

## 🛠️ 目录与管理规范

### 1. Skills 目录扫描规则

插件会自动扫描以下位置的 Skills：

- **项目级（Project Scope）**：
  - `<项目根目录>/.dsh/skills` 与 `<项目根目录>/.dsh/skills-disable`
  - `<项目根目录>/.agents/skills` 与 `<项目根目录>/.agents/skills-disable`
- **全局级（Global Scope）**：
  - `~/.dsh/skills` 与 `~/.dsh/skills-disable`
  - `~/.agents/skills` 与 `~/.agents/skills-disable`

> 💡 **启停逻辑**：停用某技能时，该技能目录或 `.md` 单文件会被平移到对应的 `skills-disable` 目录中；开启时移回 `skills`。

### 2. MCP 配置规则

- 全局 MCP 读取自 `~/.dsh/cordis.patch.yml`。
- 启用时移除 MCP 配置项中的 `disabled: true` 字段；停用时自动写入 `disabled: true`。

---

## 💻 本地开发与测试

```bash
# 启动构建产物生成
pnpm run build

# 运行自动化测试
pnpm test

# 代码类型检查
pnpm run typecheck
```

---

## 📄 开源许可

[MIT](./LICENSE)
