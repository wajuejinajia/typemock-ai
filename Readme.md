# TypeMock AI

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Type is Truth.** AI-powered Mock Data Generator that understands your TypeScript interfaces and JSDoc semantics.

## Features

- **Type-to-Mock** - Automatically parse TypeScript interfaces and generate matching mock data
- **JSDoc Semantics** - AI reads your JSDoc comments to generate contextually accurate data
- **Live Watch Mode** - Auto-regenerate when your type definitions change
- **Multi-Model Support** - Works with OpenAI, DeepSeek, Moonshot, Gemini, and more
- **HTTP API** - RESTful endpoints for easy integration
- **Beautiful CLI** - Modern terminal UI with spinners and colors

## Quick Start

### Installation

```bash
# Install globally
bun add -g typemock-ai

# Or run directly
bunx typemock-ai
```

### Setup API Key

Create a `.env` file or export environment variables:

```bash
# OpenAI
export OPENAI_API_KEY="sk-xxx"

# Or DeepSeek (recommended, cost-effective)
export OPENAI_API_KEY="sk-xxx"
export OPENAI_BASE_URL="https://api.deepseek.com"
export OPENAI_MODEL="deepseek-chat"

# Or Gemini
export OPENAI_API_KEY="AIzaSyXXX"
export OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
export OPENAI_MODEL="gemini-2.0-flash"
```

### Run

```bash
# Interactive mode
bun run dev

# Quick mode (skip prompts)
bun run start
```

## Usage

### Define Your Interface

Create a TypeScript file with JSDoc annotations:

```typescript
// examples/demo.ts

/**
 * User profile information
 */
export interface UserProfile {
  /** Unique user ID, UUID format */
  id: string;

  /** Username, 3-20 characters, alphanumeric only */
  username: string;

  /** User email address */
  email: string;

  /** User age, range 1-150 */
  age: number;

  /** VIP status */
  isVip: boolean;

  /** User level: 'bronze' | 'silver' | 'gold' | 'platinum' */
  level: "bronze" | "silver" | "gold" | "platinum";
}
```

### Generate Mock Data

```bash
# Start the server
bun run dev

# Request mock data
curl http://localhost:3000/api/mock/UserProfile
```

### Response

```json
{
  "data": {
    "id": "8f9d88a2-1b3c-4e1d-9b7a-7c6e5a3b2f1a",
    "username": "john_doe123",
    "email": "john.doe@example.com",
    "age": 28,
    "isVip": true,
    "level": "gold"
  },
  "meta": {
    "interfaceName": "UserProfile",
    "fromCache": false
  }
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/interfaces` | List all available interfaces |
| GET | `/api/mock/:name` | Generate mock data for interface |
| GET | `/api/mock/:name?force=true` | Force regenerate (skip cache) |
| DELETE | `/api/cache/:name` | Clear cache for interface |
| DELETE | `/api/cache` | Clear all cache |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | API key (required) | - |
| `OPENAI_BASE_URL` | API base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model name | `gpt-3.5-turbo` |
| `PORT` | Server port | `3000` |
| `TS_FILE_PATH` | TypeScript file to parse | `examples/demo.ts` |

### Supported Models

| Provider | Base URL | Model |
|----------|----------|-------|
| OpenAI | `https://api.openai.com/v1` | `gpt-3.5-turbo`, `gpt-4` |
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` |
| Moonshot | `https://api.moonshot.cn/v1` | `moonshot-v1-8k` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` |

## Build

Generate a standalone executable:

```bash
bun run build
# Output: dist/typemock
```

## Project Structure

```
typemock-ai/
├── src/
│   ├── core/
│   │   ├── parser.ts      # TypeScript AST parser
│   │   ├── generator.ts   # AI mock generator
│   │   ├── cache.ts       # File-based cache
│   │   └── watcher.ts     # File watcher
│   ├── server.ts          # Hono HTTP server
│   └── index.ts           # CLI entry point
├── examples/
│   └── demo.ts            # Sample interfaces
├── .env.example           # Environment template
└── package.json
```

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  TypeScript     │     │   AST Parser    │     │   AI Generator  │
│  Interface      │ ──▶ │   (ts-morph)    │ ──▶ │   (OpenAI SDK)  │
│  + JSDoc        │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                       │
                                ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Field Schema   │     │  Realistic      │
                        │  - name         │     │  Mock Data      │
                        │  - type         │     │  (JSON)         │
                        │  - docs (JSDoc) │     │                 │
                        └─────────────────┘     └─────────────────┘
```

## License

MIT
