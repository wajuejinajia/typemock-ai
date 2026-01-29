import OpenAI from "openai";
import type { InterfaceSchema } from "./parser";

// 延迟初始化 OpenAI 客户端
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "未配置 OPENAI_API_KEY 环境变量。请设置后重试：\n" +
        "  export OPENAI_API_KEY=your-api-key\n" +
        "  export OPENAI_BASE_URL=https://api.deepseek.com  # 可选，兼容其他模型"
      );
    }
    client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return client;
}

// 默认模型，可通过环境变量覆盖
const MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

const SYSTEM_PROMPT = `你是一个专业的 Mock 数据生成器。请根据用户提供的 JSON Schema 和 JSDoc 描述，生成极其逼真的测试数据。

规则：
1. 严格遵循 Schema 中定义的类型
2. 根据 JSDoc 注释（docs 字段）理解字段的业务语义，生成符合描述的真实数据
3. 对于有格式要求的字段（如邮箱、UUID、日期），生成符合格式的数据
4. 对于有取值范围的字段（如年龄 1-150），生成合理范围内的值
5. 对于枚举类型，从允许的值中选择
6. 数组类型生成 2-4 个元素
7. 只返回纯 JSON 对象，不要包含任何 Markdown 格式、代码块或解释文字`;

/**
 * 构建用户 Prompt
 */
function buildUserPrompt(schema: InterfaceSchema): string {
  return `请根据以下 Interface Schema 生成一条 Mock 数据：

接口名称：${schema.name}
接口描述：${schema.docs || "无"}

字段定义：
${JSON.stringify(schema.fields, null, 2)}

请直接返回 JSON 对象，不要包含任何其他内容。`;
}

/**
 * 清理 AI 返回的内容，提取纯 JSON
 */
function extractJson(content: string): string {
  let cleaned = content.trim();

  // 移除 markdown 代码块
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * 生成 Mock 数据
 * @param schema Interface 的 Schema 信息
 * @returns 生成的 Mock 数据对象
 */
export async function generateMockData<T = unknown>(
  schema: InterfaceSchema
): Promise<T> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(schema) },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI 返回内容为空");
  }

  const jsonStr = extractJson(content);

  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    throw new Error(
      `JSON 解析失败: ${error instanceof Error ? error.message : "未知错误"}\n原始内容: ${content}`
    );
  }
}

/**
 * 批量生成 Mock 数据
 * @param schema Interface 的 Schema 信息
 * @param count 生成数量
 * @returns 生成的 Mock 数据数组
 */
export async function generateMockDataBatch<T = unknown>(
  schema: InterfaceSchema,
  count: number
): Promise<T[]> {
  const batchPrompt = `请根据以下 Interface Schema 生成 ${count} 条不同的 Mock 数据：

接口名称：${schema.name}
接口描述：${schema.docs || "无"}

字段定义：
${JSON.stringify(schema.fields, null, 2)}

请直接返回 JSON 数组，包含 ${count} 个对象，不要包含任何其他内容。`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: batchPrompt },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI 返回内容为空");
  }

  const jsonStr = extractJson(content);

  try {
    const result = JSON.parse(jsonStr);
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    throw new Error(
      `JSON 解析失败: ${error instanceof Error ? error.message : "未知错误"}\n原始内容: ${content}`
    );
  }
}
