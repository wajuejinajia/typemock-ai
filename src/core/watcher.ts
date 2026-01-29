import { watch } from "fs";
import pc from "picocolors";
import * as cache from "./cache";

type WatchCallback = (event: string, filename: string | null) => void;

/**
 * 创建防抖函数
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

/**
 * 启动文件监听
 * @param filePath 要监听的文件路径
 * @param onClearCache 缓存清除后的回调（可选）
 */
export function startWatcher(
  filePath: string,
  onClearCache?: () => void
): void {
  const handleChange = debounce(async (event: string) => {
    if (event === "change") {
      console.log();
      console.log(pc.yellow("⚡ File change detected!"));
      console.log(pc.dim(`   ${filePath}`));

      // 清除所有缓存
      await cache.clear();

      console.log(pc.green("✓ Cache cleared."));
      console.log(pc.dim("  Next request will regenerate data with AI."));
      console.log();

      onClearCache?.();
    }
  }, 300); // 300ms 防抖

  try {
    watch(filePath, (event, filename) => {
      handleChange(event);
    });

    console.log(pc.dim(`👀 Watching: ${filePath}`));
  } catch (error) {
    console.error(pc.red(`Failed to watch file: ${filePath}`));
    console.error(pc.dim(error instanceof Error ? error.message : String(error)));
  }
}
