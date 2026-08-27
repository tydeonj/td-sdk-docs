# TD SDK 对接文档

对外文档（第一稿 **1.0.0**）。SDK 版本：Android / iOS `1.0.0.1`。

- Markdown：[TD_SDK_对接文档/](./TD_SDK_对接文档/)
- 网页站（VitePress）：[docs-site/](./docs-site/)
- 隐私披露：[TD_SDK_国内隐私合规使用说明.md](./TD_SDK_国内隐私合规使用说明.md)

本仓库**只含对接文档**，不含 SDK 源码、Demo 广告位、密钥。

## 本地打开网页

```bash
cd docs-site
npm install
npm run docs:dev
```

浏览器访问终端里的地址（一般是 `http://127.0.0.1:5173`）。

导出静态站：

```bash
npm run docs:build
```

产物在 `docs-site/.vitepress/dist/`，可挂到 Gitee Pages 或任意静态托管。
