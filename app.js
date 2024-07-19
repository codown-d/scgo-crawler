// 使用 import 导入模块
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");
const app = express();
app.use(express.static(path.join(__dirname, "/dist")));

let getSeason = () => {
  return new Promise((resolve, reject) => {
    request("https://csgod.top/top?type=0", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        $("input.hidden").each(function (index, value) {
          resolve($(value).attr("value"));
        });
      }
    });
  });
};
app.get("/api/season", async (req, res) => {
  let season = await getSeason();
  console.log(season);
  res.json({ data: { season: season } });
});
// 定义反向代理路由
// app.use("/csgod", proxy(`https://csgod.top/`));
app.use(
  "/csgod",
  createProxyMiddleware({
    target: "https://csgod.top/", // 目标服务器的地址
    changeOrigin: true, // 将请求头中的 Host 字段更改为目标 URL 的主机名和端口
    secure: true, // 禁用 SSL 证书验证（如果目标服务器是 HTTPS，可以设为 true）
    pathRewrite: {
      "^/csgod": "", // 可选：路径重写，将请求路径中的 '/example' 替换为 '/'
    },
  })
);

// 监听端口
const port = 3000;
app.listen(port, () => {
  console.log(`Proxy server is running on http://localhost:${port}`);
});
