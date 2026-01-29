# TypeMock AI

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **类型即真理。** 基于 TypeScript AST 和 JSDoc 语义的 AI Mock 数据生成器。

[English](./README.md) | 简体中文

## 特性

- **类型驱动** - 自动解析 TypeScript 接口，生成符合类型定义的 Mock 数据
- **语义理解** - AI 读取 JSDoc 注释，生成符合业务语义的真实数据
- **实时监听** - Watch 模式，类型定义变更时自动清除缓存
- **多模型支持** - 兼容 OpenAI、DeepSeek、Moonshot、Gemini 等主流大模型
- **HTTP API** - RESTful 接口，方便集成到任何项目
- **精美 CLI** - 现代化终端界面，Spinner 动画和彩色日志

## 快速开始

### 安装

```bash
# 全局安装
bun add -g typemock-ai

# 或直接运行
bunx typemock-ai
```

### 配置 API Key

创建 `.env` 文件或设置环境变量：

```bash
# OpenAI
export OPENAI_API_KEY="sk-xxx"

# DeepSeek（推荐，性价比高）
export OPENAI_API_KEY="sk-xxx"
export OPENAI_BASE_URL="https://api.deepseek.com"
export OPENAI_MODEL="deepseek-chat"

# Gemini
export OPENAI_API_KEY="AIzaSyXXX"
export OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
export OPENAI_MODEL="gemini-2.0-flash"

# 月之暗面 (Moonshot)
export OPENAI_API_KEY="sk-xxx"
export OPENAI_BASE_URL="https://api.moonshot.cn/v1"
export OPENAI_MODEL="moonshot-v1-8k"
```

### 启动服务

```bash
# 交互模式
bun run dev

# 快速模式（跳过交互）
bun run start
```

## 使用方法

### 1. 定义接口

创建一个 TypeScript 文件，使用 JSDoc 注释描述字段语义：

```typescript
// examples/demo.ts

/**
 * 用户资料信息
 */
export interface UserProfile {
  /** 用户唯一ID，UUID格式 */
  id: string;

  /** 用户名，3-20个字符，只允许字母数字下划线 */
  username: string;

  /** 用户邮箱地址，需符合邮箱格式 */
  email: string;

  /** 用户年龄，范围 1-150 */
  age: number;

  /** 是否为VIP用户 */
  isVip: boolean;

  /** 用户等级，必须是 'bronze' | 'silver' | 'gold' | 'platinum' 之一 */
  level: "bronze" | "silver" | "gold" | "platinum";

  /** 用户兴趣爱好列表 */
  hobbies: string[];
}
```

### 2. 生成 Mock 数据

```bash
# 启动服务
bun run dev

# 请求 Mock 数据
curl http://localhost:3000/api/mock/UserProfile
```

### 3. 返回结果

```json
{
  "data": {
    "id": "8f9d88a2-1b3c-4e1d-9b7a-7c6e5a3b2f1a",
    "username": "zhang_san_2024",
    "email": "zhangsan@example.com",
    "age": 28,
    "isVip": true,
    "level": "gold",
    "hobbies": ["阅读", "摄影", "旅行"]
  },
  "meta": {
    "interfaceName": "UserProfile",
    "fromCache": false
  }
}
```

## 传统 Mock vs TypeMock AI

| 传统 Mock 工具 | TypeMock AI |
|---------------|-------------|
| `username: "xkj2h3"` | `username: "zhang_san_2024"` |
| `age: 9999` | `age: 28` |
| `email: "asdf"` | `email: "zhangsan@example.com"` |
| 随机数据，无语义 | 符合 JSDoc 描述的真实数据 |

## API 接口

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/` | API 信息 |
| GET | `/api/interfaces` | 列出所有可用接口 |
| GET | `/api/mock/:name` | 生成指定接口的 Mock 数据 |
| GET | `/api/mock/:name?force=true` | 强制刷新（跳过缓存） |
| DELETE | `/api/cache/:name` | 清除指定接口的缓存 |
| DELETE | `/api/cache` | 清除所有缓存 |

## 配置项

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | API 密钥（必填） | - |
| `OPENAI_BASE_URL` | API 地址 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 模型名称 | `gpt-3.5-turbo` |
| `PORT` | 服务端口 | `3000` |
| `TS_FILE_PATH` | TypeScript 文件路径 | `examples/demo.ts` |

### 支持的模型

| 服务商 | Base URL | 模型 |
|--------|----------|------|
| OpenAI | `https://api.openai.com/v1` | `gpt-3.5-turbo`, `gpt-4` |
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` |
| Moonshot | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` |

## 构建

生成独立可执行文件：

```bash
bun run build
# 输出: dist/typemock
```

## 项目结构

```
typemock-ai/
├── src/
│   ├── core/
│   │   ├── parser.ts      # TypeScript AST 解析器
│   │   ├── generator.ts   # AI Mock 生成器
│   │   ├── cache.ts       # 文件缓存
│   │   └── watcher.ts     # 文件监听
│   ├── server.ts          # Hono HTTP 服务器
│   └── index.ts           # CLI 入口
├── examples/
│   └── demo.ts            # 示例接口定义
├── .env.example           # 环境变量模板
└── package.json
```

## 工作原理

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TypeScript    │     │    AST 解析器    │     │    AI 生成器    │
│   Interface     │ ──▶ │   (ts-morph)    │ ──▶ │  (OpenAI SDK)   │
│   + JSDoc       │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   字段 Schema    │     │    真实的       │
                        │   - name        │     │   Mock 数据     │
                        │   - type        │     │    (JSON)       │
                        │   - docs        │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## 为什么选择 TypeMock AI？

1. **类型即文档** - 你的 TypeScript 接口本身就是最好的 Mock 数据描述
2. **JSDoc 即 Prompt** - 字段注释直接作为 AI 生成数据的上下文
3. **零配置** - 无需编写 Mock 规则，AI 自动理解语义
4. **实时同步** - 修改接口定义，Mock 数据自动更新

## 许可证

MIT
