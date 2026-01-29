import { mkdir } from "fs/promises";
import { dirname } from "path";

const CACHE_DIR = ".typemock";
const CACHE_FILE = `${CACHE_DIR}/cache.json`;

interface CacheEntry {
  data: unknown;
  createdAt: string;
}

interface CacheStore {
  [key: string]: CacheEntry;
}

/**
 * 确保缓存目录存在
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // 目录已存在，忽略错误
  }
}

/**
 * 读取缓存文件
 */
async function readCacheFile(): Promise<CacheStore> {
  const file = Bun.file(CACHE_FILE);
  const exists = await file.exists();

  if (!exists) {
    return {};
  }

  try {
    const text = await file.text();
    return JSON.parse(text) as CacheStore;
  } catch {
    return {};
  }
}

/**
 * 写入缓存文件
 */
async function writeCacheFile(store: CacheStore): Promise<void> {
  await ensureCacheDir();
  await Bun.write(CACHE_FILE, JSON.stringify(store, null, 2));
}

/**
 * 获取缓存数据
 * @param key 缓存键名（通常是 interfaceName）
 * @returns 缓存的数据，如果不存在则返回 null
 */
export async function get<T = unknown>(key: string): Promise<T | null> {
  const store = await readCacheFile();
  const entry = store[key];

  if (!entry) {
    return null;
  }

  return entry.data as T;
}

/**
 * 设置缓存数据
 * @param key 缓存键名
 * @param data 要缓存的数据
 */
export async function set(key: string, data: unknown): Promise<void> {
  const store = await readCacheFile();

  store[key] = {
    data,
    createdAt: new Date().toISOString(),
  };

  await writeCacheFile(store);
}

/**
 * 删除指定缓存
 * @param key 缓存键名
 */
export async function remove(key: string): Promise<void> {
  const store = await readCacheFile();
  delete store[key];
  await writeCacheFile(store);
}

/**
 * 清空所有缓存
 */
export async function clear(): Promise<void> {
  await writeCacheFile({});
}

/**
 * 检查缓存是否存在
 * @param key 缓存键名
 */
export async function has(key: string): Promise<boolean> {
  const store = await readCacheFile();
  return key in store;
}
