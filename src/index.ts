import { extractInterfaceSchema, extractAllInterfaceSchemas } from "./core/parser";
import { resolve } from "path";

// 获取 demo.ts 的绝对路径
const demoFilePath = resolve(import.meta.dir, "../examples/demo.ts");

console.log("=".repeat(60));
console.log("TypeMock AI - AST Parser Demo");
console.log("=".repeat(60));
console.log(`\nParsing file: ${demoFilePath}\n`);

// 提取 UserProfile 接口
console.log("-".repeat(60));
console.log("Extracting UserProfile interface...");
console.log("-".repeat(60));

const userProfileSchema = extractInterfaceSchema(demoFilePath, "UserProfile");

if (userProfileSchema) {
  console.log("\nInterface Schema:");
  console.log(JSON.stringify(userProfileSchema, null, 2));
}

// 提取所有接口
console.log("\n" + "=".repeat(60));
console.log("Extracting all interfaces...");
console.log("=".repeat(60));

const allSchemas = extractAllInterfaceSchemas(demoFilePath);

console.log(`\nFound ${allSchemas.length} interfaces:\n`);
allSchemas.forEach((schema) => {
  console.log(`- ${schema.name}: ${schema.fields.length} fields`);
});
