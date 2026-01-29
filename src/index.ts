#!/usr/bin/env bun
import { intro, outro, text, spinner, isCancel, cancel } from "@clack/prompts";
import pc from "picocolors";
import { resolve } from "path";
import { existsSync } from "fs";
import app, { setTsFilePath, tsFilePath } from "./server";
import { startWatcher } from "./core/watcher";

const PORT = Number(process.env.PORT) || 3000;
const QUICK_MODE = process.argv.includes("--quick") || !process.stdin.isTTY;

async function main() {
  const defaultPath = "examples/demo.ts";
  let filePath: string;

  if (QUICK_MODE) {
    // 快速模式：跳过交互，使用默认值
    console.log();
    console.log(pc.bgCyan(pc.black(" TypeMock AI (Bun Edition) ")));
    console.log();
    filePath = resolve(process.cwd(), defaultPath);
  } else {
    // 交互模式
    console.clear();

    intro(pc.bgCyan(pc.black(" TypeMock AI (Bun Edition) ")));

    const filePathInput = await text({
      message: "Enter the TypeScript file to watch:",
      placeholder: defaultPath,
      defaultValue: defaultPath,
      validate(value) {
        const fullPath = resolve(process.cwd(), value || defaultPath);
        if (!existsSync(fullPath)) {
          return `File not found: ${fullPath}`;
        }
      },
    });

    if (isCancel(filePathInput)) {
      cancel("Operation cancelled.");
      process.exit(0);
    }

    filePath = resolve(process.cwd(), filePathInput || defaultPath);

    const s = spinner();
    s.start("Starting server...");
    await new Promise((r) => setTimeout(r, 500));
    s.stop("Server started!");
  }

  setTsFilePath(filePath);

  // 打印服务信息
  console.log();
  console.log(pc.bgGreen(pc.black(" SERVER INFO ")));
  console.log();
  console.log(`  ${pc.dim("Server URL:")}      ${pc.cyan(`http://localhost:${PORT}`)}`);
  console.log(`  ${pc.dim("Mock Endpoint:")}   ${pc.cyan(`http://localhost:${PORT}/api/mock/:interfaceName`)}`);
  console.log(`  ${pc.dim("Watching:")}        ${pc.yellow(filePath)}`);
  console.log();
  console.log(pc.dim("─".repeat(60)));
  console.log();

  // 启动文件监听
  startWatcher(filePath);

  console.log(pc.dim("Press Ctrl+C to stop the server."));
  console.log();
}

// 运行主函数
main().catch((err) => {
  console.error(pc.red("Failed to start:"), err);
  process.exit(1);
});

// 导出 Bun 服务器配置
export default {
  port: PORT,
  fetch: app.fetch,
  idleTimeout: 120,
};
