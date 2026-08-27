# 13 FAQ

> 文档版本：1.0.0

---

## 初始化

**必须调 `setPrivacyUserAgree(true)` 才能出广告吗？**  
不必。默认就是开。只在用户明确拒绝时调 `false`。详见 [04](./04_初始化与隐私.md)。

**可以在子进程 Init 吗？**  
Android 不行，必须主进程。iOS 在 `didFinishLaunching`。

**Init 还没回调就 Load？**  
不要。尤其是冷启动开屏，等 Init 成功。

---

## 填充与设备标识

**JinDai / AdGain 为什么没广告？**  
这两家依赖 OAID（Android）或 IDFA（iOS）。四门未开、OAID 还没回写、或用户拒绝 ATT，都可能无填充。见 [04](./04_初始化与隐私.md)。

**`resolveOaidForAdn` 是 null？**  
采集是异步的。等厂商 SDK 回写后再 Load，不要在 Init 当帧立刻请求。

**必须接 MSA / ATTracking？**  
要接 JinDai、AdGain 等依赖设备标识的源时，需要。其它源按该平台文档。

---

## 广告展示

**Load 成功了为什么 Show 说没缓存？**  
原生后台若配的是自渲染，客户端却当模板 Show（或反过来）会失败。以 `renderType` 为准。也可能上一轮已 Show 过，需重新 Load。

**原生 Load 完容器里已经有字？**  
那是宿主在 `onAdLoaded` 里拼装了。SDK 不会自动 Show。把拼装挪到点 Show 时。

**自渲染只有图标和字、点了没反应？**  
缺主图：没把 `imageUrl` 填进带 `td_image` 的 ImageView。  
点不动：Android 控件要 `clickable`；iOS `UILabel` 要 `userInteractionEnabled=YES`；并打上 TAG。

**京东 Banner 被压扁？**  
官方高度自适应。容器不要锁 50dp，建议 ≥200dp。见 [08](./08_横幅广告.md)。

**开屏容器必须全屏吗？**  
是。过小会无法展示。Android 用 `INVISIBLE` 不要 `GONE`。

---

## 集成

**插屏报 adapter 缺失，激励却正常？**  
激励和插屏是不同模块。Android / iOS 都要单独加对应 TD 模块和三方 SDK。见 [02](./02_Android集成.md) / [03](./03_iOS集成.md)。

**AdGain 没有 Banner？**  
该平台无 Banner API，会 `formatUnsupported`。换源或不要给 Banner 位配 AdGain。

**iOS 能跑但编译仍有链接警告？**  
核对 ATS、`-ObjC`、LiteMob 版本与 rpath。见 [03](./03_iOS集成.md)。

---

## 回调与重试

**失败了立刻再 Load？**  
不要。必须重试时自己控制间隔。上一轮未结束会走 `onAdIsLoading`。

**`onAdReward` 和 `onAdClosed` 哪个先？**  
通常先 Reward 再 Close。以实际回调为准，发奖只写在 `onAdReward`。

**错误码在哪查？**  
[11 回调与错误码](./11_回调与错误码.md)。

