// 使用 import 导入模块
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(express.static('./dist'));
// 定义反向代理路由
app.use('/csgod', createProxyMiddleware({
  target: 'https://csgod.top/',  // 目标服务器的地址
  changeOrigin: true,              // 将请求头中的 Host 字段更改为目标 URL 的主机名和端口
  secure: true,                   // 禁用 SSL 证书验证（如果目标服务器是 HTTPS，可以设为 true）
  pathRewrite: {
    '^/csgod': '',             // 可选：路径重写，将请求路径中的 '/example' 替换为 '/'
  },
}));

// 监听端口
const port = 3000;
app.listen(port, () => {
  console.log(`Proxy server is running on http://localhost:${port}`);
});