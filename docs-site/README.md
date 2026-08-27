# TD SDK 对接文档站点

把 [`../TD_SDK_对接文档/`](../TD_SDK_对接文档/) 里的 Markdown 做成和 TradPlus / TopOn 类似的文档站。正文只维护一份，网页和 GitHub 读同一目录。

## 本地预览

```bash
cd word/docs-site
npm install
npm run docs:dev
```

浏览器打开终端里提示的地址（一般是 `http://localhost:5173`）。

## 导出静态站

```bash
npm run docs:build
```

产物在 `.vitepress/dist/`，可丢到任意静态托管。本地预览构建结果：

```bash
npm run docs:preview
```

## 改文档

改 `word/TD_SDK_对接文档/*.md`，刷新网页即可。不要在本目录复制一份正文。
