import { Hono } from "hono";
import { cors } from "hono/cors";
import { resolve } from "path";
import { extractInterfaceSchema, extractAllInterfaceSchemas } from "./core/parser";
import { generateMockData } from "./core/generator";
import * as cache from "./core/cache";

// 创建 Hono 实例
const app = new Hono();

// 启用 CORS
app.use("/*", cors());

// 默认的 TypeScript 文件路径（可通过环境变量覆盖）
const DEFAULT_TS_FILE = resolve(import.meta.dir, "../examples/demo.ts");
const TS_FILE_PATH = process.env.TS_FILE_PATH || DEFAULT_TS_FILE;

/**
 * 健康检查
 */
app.get("/", (c) => {
  return c.json({
    name: "TypeMock AI",
    version: "1.0.0",
    status: "running",
    endpoints: {
      "GET /api/interfaces": "列出所有可用的 Interface",
      "GET /api/mock/:interfaceName": "生成指定 Interface 的 Mock 数据",
      "DELETE /api/cache/:interfaceName": "清除指定 Interface 的缓存",
      "DELETE /api/cache": "清除所有缓存",
    },
  });
});

/**
 * 列出所有可用的 Interface
 */
app.get("/api/interfaces", (c) => {
  try {
    const schemas = extractAllInterfaceSchemas(TS_FILE_PATH);
    const interfaces = schemas.map((s) => ({
      name: s.name,
      docs: s.docs,
      fieldCount: s.fields.length,
    }));

    return c.json({
      file: TS_FILE_PATH,
      interfaces,
    });
  } catch (error) {
    return c.json(
      {
        error: "解析文件失败",
        message: error instanceof Error ? error.message : "未知错误",
      },
      500
    );
  }
});

/**
 * 生成 Mock 数据
 * GET /api/mock/:interfaceName
 * Query params:
 *   - force: 是否强制刷新缓存（true/false）
 */
app.get("/api/mock/:interfaceName", async (c) => {
  const interfaceName = c.req.param("interfaceName");
  const forceRefresh = c.req.query("force") === "true";

  // 1. 解析 Schema
  const schema = extractInterfaceSchema(TS_FILE_PATH, interfaceName);

  if (!schema) {
    return c.json(
      {
        error: "Interface 不存在",
        message: `未找到名为 "${interfaceName}" 的 Interface`,
        hint: "使用 GET /api/interfaces 查看所有可用的 Interface",
      },
      404
    );
  }

  // 2. 检查缓存
  if (!forceRefresh) {
    const cached = await cache.get(interfaceName);
    if (cached) {
      return c.json({
        data: cached,
        meta: {
          interfaceName,
          fromCache: true,
        },
      });
    }
  }

  // 3. 调用 AI 生成
  try {
    const data = await generateMockData(schema);

    // 4. 写入缓存
    await cache.set(interfaceName, data);

    return c.json({
      data,
      meta: {
        interfaceName,
        fromCache: false,
      },
    });
  } catch (error) {
    return c.json(
      {
        error: "生成失败",
        message: error instanceof Error ? error.message : "未知错误",
      },
      500
    );
  }
});

/**
 * 清除指定 Interface 的缓存
 */
app.delete("/api/cache/:interfaceName", async (c) => {
  const interfaceName = c.req.param("interfaceName");
  await cache.remove(interfaceName);

  return c.json({
    success: true,
    message: `已清除 "${interfaceName}" 的缓存`,
  });
});

/**
 * 清除所有缓存
 */
app.delete("/api/cache", async (c) => {
  await cache.clear();

  return c.json({
    success: true,
    message: "已清除所有缓存",
  });
});

export default app;
