import app from "./server";

const PORT = process.env.PORT || 3000;

console.log(`
╔════════════════════════════════════════════════════════════╗
║                      TypeMock AI                           ║
║           AI-Powered Mock Data Generator                   ║
╚════════════════════════════════════════════════════════════╝
`);

console.log(`Server running at http://localhost:${PORT}`);
console.log(`
Available endpoints:
  GET  /                         - API 信息
  GET  /api/interfaces           - 列出所有 Interface
  GET  /api/mock/:interfaceName  - 生成 Mock 数据
  GET  /api/mock/:interfaceName?force=true - 强制刷新
`);

export default {
  port: PORT,
  fetch: app.fetch,
};
