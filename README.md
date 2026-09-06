# dsh-mcp-skill-manager

DeepSeek Harness (DSH) 插件：在聊天框（输入框）中新增管理按钮，直观展示并即时开关当前项目级与全局级的 MCP 和 Skill。

## 特性

- **聊天框集成**：在模型选择器左侧（`conversation.input.right`）添加「MCP & Skill 管理」按钮。
- **层级排序**：严格先显示**项目级**（Project-Level），再显示**全局级**（Global-Level）。
- **即时激活/停用开关**：
  - **Skill（项目级与全局级）**：开启时处于 `skills` 目录，停用时即时移动至同级 `skill-disable` 文件夹，避开 DSH 默认检索策略以停止加载；重新开启时移回 `skills`。
  - **MCP（全局级）**：通过读取并修改 `~/.dsh/cordis.patch.yml` 中的对应 MCP 配置项，添加或移除 `disabled: true` 属性实现激活与停用。
- **轻量弹窗管理**：支持关键词过滤搜索、项目级/全局级分类筛选、即时状态反馈与平滑交互。

## 目录与文件规范

### 1. Skill 目录扫描规则
- **项目级**：
  - `<projectRoot>/.dsh/skills` 与 `<projectRoot>/.dsh/skill-disable`
  - `<projectRoot>/.agents/skills` 与 `<projectRoot>/.agents/skill-disable`
- **全局级**：
  - `~/.dsh/skills` 与 `~/.dsh/skill-disable`
  - `~/.agents/skills` 与 `~/.agents/skill-disable`

### 2. MCP 规范
- 全局 MCP 来源为 `~/.dsh/cordis.patch.yml` 中的 `insert` 项。
- 停用时添加 `disabled: true`，启用时移除 `disabled` 属性。

## 架构说明

- **Host 端 (`src/index.ts`)**：通过 Cordis `connection.rpc` 提供 `/mcp-skill-manager` 通道，处理 `list`、`toggle-skill`、`toggle-mcp` 等文件与配置操作。
- **Client 端 (`src/client/`)**：向 `conversation.input.right` 注册按钮插槽，点击弹出管理弹窗，并通过 RPC 与 Host 通信。
