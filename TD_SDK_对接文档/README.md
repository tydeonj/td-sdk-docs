# TD SDK 对接文档

> 文档版本：**1.0.0**（第一稿，尚未对外发布）  
> SDK 版本：Android / iOS **`1.0.0.1`**（文档版本与 SDK 版本分开计）  
> 网页版：进入 [`../docs-site`](../docs-site/README.md)，执行 `npm install && npm run docs:dev`

欢迎使用 TD 聚合 SDK。按下面顺序做即可接入激励、插屏、开屏、横幅、原生。

正式上线请使用后台为**您的应用**签发的 App ID、广告位 ID。正文示例一律写 `YOUR_APP_ID` / `YOUR_AD_UNIT_ID`，不要把 Demo 数字写进正式包。

隐私政策与字段禁报见 [`../TD_SDK_国内隐私合规使用说明.md`](../TD_SDK_国内隐私合规使用说明.md)。三步速查见对外 Demo：[`../../project/demo/android/tdsdkdemo/接入指南.md`](../../project/demo/android/tdsdkdemo/接入指南.md)、[`../../project/demo/ios/接入指南.md`](../../project/demo/ios/接入指南.md)。

---

## 怎么读

| 您要做的 | 看哪一篇 |
| --- | --- |
| 开通后台、建应用 / 广告位 / 广告源 | [01 后台配置](./01_后台配置.md) |
| 把 SDK 编进 Android 工程 | [02 Android 集成](./02_Android集成.md) |
| 把 SDK 编进 iOS 工程 | [03 iOS 集成](./03_iOS集成.md) |
| 初始化、隐私开关、全局 API | [04 初始化与隐私](./04_初始化与隐私.md) |
| 接某一种广告 | [05](./05_激励视频.md)～[09](./09_原生广告.md) |
| 底价、尺寸、userId | [10 自定义参数与尺寸](./10_自定义参数与尺寸.md) |
| 回调字段、错误码 | [11 回调与错误码](./11_回调与错误码.md) |
| 怎么验集成成功 | [12 测试验收](./12_测试验收.md) |
| 常见问题 | [13 FAQ](./13_FAQ.md) |

Android 用 Maven，iOS 用 CocoaPods。代码示例可对照官方 Demo，正式工程不要抄 Demo 的本地仓库。

---

## 目录结构

```text
word/TD_SDK_对接文档/
├── README.md                 ← 本页
├── 01_后台配置.md
├── 02_Android集成.md         ← Manifest / 混淆 / 按源依赖
├── 03_iOS集成.md             ← ATS / ATT / SKAdNetwork / PrivacyInfo
├── 04_初始化与隐私.md
├── 05_激励视频.md
├── 06_插屏广告.md
├── 07_开屏广告.md
├── 08_横幅广告.md
├── 09_原生广告.md            ← renderType / 自渲染 TAG / Load ≠ Show
├── 10_自定义参数与尺寸.md
├── 11_回调与错误码.md
├── 12_测试验收.md
└── 13_FAQ.md
```

每篇顶部可回本目录。示例一律 `YOUR_APP_ID` / `YOUR_AD_UNIT_ID`。

---

## 推荐顺序

1. [后台配置](./01_后台配置.md)：应用 → 广告位 → 广告源 → 瀑布流  
2. 只看您的端：[Android 集成](./02_Android集成.md) 或 [iOS 集成](./03_iOS集成.md)  
3. [初始化](./04_初始化与隐私.md)（用户同意隐私政策之后；仅主进程 / `didFinishLaunching`）  
4. 按格式抄 Load → `isReady` → Show  
5. [测试验收](./12_测试验收.md)

SDK **不会**在 Load 成功后自动 Show。原生自渲染要先拼布局再 Show。

---

## 调用顺序（双端同一套）

| 步骤 | Android | iOS |
| --- | --- | --- |
| 1 | 用户同意隐私政策 | 同左；需要 IDFA 时先 ATT |
| 2 | 主进程 `TDAdsSDK.initSdk` | `didFinishLaunching` 里 `initSdkWithAppId` |
| 3 | `new TDXxx(ctx, YOUR_AD_UNIT_ID)` | `initWithAdUnitId:` |
| 4 | `setAdListener` | `setAdListener:` |
| 5 | 可选尺寸 / `userId` 等 | 同左 |
| 6 | `loadAd` | `loadAd` |
| 7 | `isReady` 为 true 再 `showAd` | `isReady` 再 `showAdFrom:…` |
| 8 | 离开页面 `onDestroy` | `onDestroy` |

| 格式 | 类 | 容器 |
| --- | --- | --- |
| 激励 | `TDReward` | 无 |
| 插屏 | `TDInterstitial` | 无 |
| 开屏 | `TDSplash` | 近全屏 overlay |
| 横幅 | `TDBanner` | 宽撑满、高 ≥50（京东建议 ≥200） |
| 原生 | `TDNative` | ≥250；自渲染先打 TAG 再 Show |

---

## 写作约定（对外正文）

- 文档版本 `1.0.0` 与 SDK 版本 `1.0.0.1` 分开写。
- 示例只用 `YOUR_APP_ID` / `YOUR_AD_UNIT_ID`，Demo 数字只出现在 Demo 工程。
- 不写 AdGain 仓库账号密码；指向对方官方文档。
- 不写 C2S / `className` / 填充分数等聚合内部实现。
- **不必**在示例里调用 `setPrivacyUserAgree(true)`；默认已开。
- Android 与 iOS 同一套步骤，差异只写平台 API 名。
