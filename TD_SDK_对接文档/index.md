---
layout: home
hero:
  name: TD SDK
  text: 对接文档
  tagline: Android / iOS 聚合接入 · 文档 1.1.6 · SDK 1.1.2.7
  actions:
    - theme: brand
      text: 从后台开始
      link: /01_后台配置
    - theme: alt
      text: Android 集成
      link: /02_Android集成
    - theme: alt
      text: iOS 集成
      link: /03_iOS集成
features:
  - title: 后台配置
    details: 建应用、广告位、广告源和瀑布流。正式包只用您自己的 App ID / 广告位 ID。
    link: /01_后台配置
  - title: 集成 SDK
    details: Android 走 Maven（Manifest、混淆）；iOS 走 CocoaPods（ATS、ATT、SKAdNetwork）。
    link: /02_Android集成
  - title: 五种广告
    details: 激励、插屏、开屏、横幅、原生。统一 Load → isReady → Show，不会自动展示。
    link: /05_激励视频
  - title: 隐私默认开
    details: 不必调用 setPrivacyUserAgree(true)。JinDai / AdGain 需要 OAID 或 IDFA。
    link: /04_初始化与隐私
---

正式上线请使用后台为**您的应用**签发的 App ID、广告位 ID。正文示例一律写 `YOUR_APP_ID` / `YOUR_AD_UNIT_ID`。

SDK **不会**在 Load 成功后自动 Show。原生自渲染要先拼布局再 Show。完整字段与合规披露见 [隐私合规](./隐私合规.md)。

## 推荐顺序

1. [后台配置](./01_后台配置.md)：应用 → 广告位 → 广告源 → 瀑布流
2. 只看您的端：[Android 集成](./02_Android集成.md) 或 [iOS 集成](./03_iOS集成.md)
3. [初始化](./04_初始化与隐私.md)（用户同意隐私政策之后；仅主进程 / `didFinishLaunching`）
4. 按格式抄 Load → `isReady` → Show
5. [测试验收](./12_测试验收.md)

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
| 横幅 | `TDBanner` | 宽撑满、高 ≥50（JinDai 建议 ≥200） |
| 原生 | `TDNative` | ≥250；自渲染先打 TAG 再 Show |
