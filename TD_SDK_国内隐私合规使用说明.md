# TD SDK — 国内隐私合规使用说明

> 对标：T/TAF 188—2023《软件开发工具包（SDK）收集个人信息技术要求》  
> 适用：Android / iOS 一期国内包  
> 门面：`TDAdsSDK`

---

## 1. 合规接入三步（宿主必须）

1. App 提供独立《隐私政策》，首次启动弹窗取得用户同意（同意/拒绝均可选，禁止默认勾选）。
2. 在隐私政策中披露 TD SDK 及下游 ADN（见 §6 披露模板）。
3. **用户同意后**再调用 `TDAdsSDK.initSdk`；同意前不得申请敏感权限、不得初始化 SDK。

```text
弹窗取得同意
  →（可选）deniedUploadDeviceInfo / setPrivacyController
  → setAuthUID / setOpenPersonalizedAd（按用户选择；AuthUID 建议 init 前）
  → initSdk
  → 请求广告
```

`setPrivacyUserAgree` **默认开，双端都不必调用。** 仅用户拒绝时传 `false`（进程内首次设置生效）。对齐 TradPlus：官网不要求再写 `true`。

采集 OAID（Android）/ IDFA（iOS）须同时：`setAuthUID(true)` + 隐私总控未关 + 个性化未关 + 字段未禁报。SDK 的 `setAuthUID` **默认关**。iOS 还须宿主申请 ATT（见 §4.6）。

---

## 2. 业务功能划分（T/TAF §4）

| 类型 | 内容 | 配置 |
|------|------|------|
| **基本业务** | 广告展示、监测归因、反作弊（聚合比价/填充） | 必要信息参与；不可因拒可选信息而整体拒绝广告 |
| **扩展业务** | 个性化推荐、产品改进类大数据分析 | `setOpenPersonalizedAd(false)` 可关；关后不得再以该功能为由采集对应信息 |

一期不提供热更新 / 自启动 / 关联启动扩展能力。

---

## 3. 必要 / 可选个人信息（T/TAF §5.2 / 附录 B 广告类）

| 类别 | 字段（示例） | 用途 | 宿主控制 |
|------|--------------|------|----------|
| **必要（一般）** | 可变设备标识（如 OAID/IDFA，受开关）、设备型号、OS 版本、屏幕分辨率、广告行为（展示/点击等）、IP/网络类型 | 归因、兼容、素材适配、效果监测、反作弊 | OAID/IDFA：`setAuthUID`；字段禁报见下 |
| **可选（扩展）** | 粗略/精确位置、安装列表、传感器、存储空间等 | 区域定向、已装 App 定向、交互类广告 | `deniedUploadDeviceInfo` / `setPrivacyUserAgree(false)` |

- 不宜收集不可变设备标识；**IMEI / IMSI / MAC 默认禁报**。
- 拒绝可选信息时，SDK **不得拒绝**与该信息无关的广告展示能力。
- 采集应在宿主调用广告业务 API（load/show）路径中进行；Open 上报须尊重禁报开关（关则不上报对应字段）。

---

## 4. 客户端配置 API

### 4.1 一览

| API | 作用 | 调用时机 |
|-----|------|----------|
| `setAuthUID(...)` | 允许 SDK 采集可变设备标识（Android=OAID，iOS=IDFA）；**默认关**；**持久化**。历史名 `setOAIDEnabled` | **建议 init 前** |
| `getAuthUID(...)` | 查询 AuthUID | 任意 |
| `setOpenPersonalizedAd(bool)` | 个性化推荐开关；**默认开**；**不持久化**，每次冷启动由宿主按用户选择重设；下次 load 生效并透传 ADN；关则不再采 OAID/IDFA。历史名 `setPersonalizedAd` | 请求广告前；可随时重设 |
| `isOpenPersonalizedAd()` | 查询当前个性化状态（`isPersonalizedAd` 同义） | 任意 |
| `setPrivacyUserAgree(bool)` | 粗粒度隐私总控（位置、设备标识等）；**默认开，不必调用**；仅拒绝时传 `false`；**进程内首次设置生效** | 仅用户拒绝时 |
| `isPrivacyUserAgree()` | 查询总控状态 | 任意 |
| `deniedUploadDeviceInfo(...)` | 字段级禁报（并集）；常量见 `TDPrivacyDeviceInfo` | **建议 init 前** |
| `getDeniedUploadDeviceInfo()` / `deniedUploadDeviceInfo` | 当前禁报集合 | 任意 |
| `setPrivacyController(controller)` | 注入全局控制器，供 Adapter/ADN `canUse*` 透传 | init 前 |

### 4.2 Android 示例

```java
// 1) 用户同意隐私政策之后
TDAdsSDK.deniedUploadDeviceInfo(
    TDPrivacyDeviceInfo.LOCATION,
    TDPrivacyDeviceInfo.APP_INSTALL_LIST,
    TDPrivacyDeviceInfo.SENSOR
);
TDAdsSDK.setPrivacyController(new TDPrivacyController() {
    @Override public boolean isCanUseLocation() { return false; }
    @Override public boolean alist() { return false; }
});
TDAdsSDK.setAuthUID(context, userAllowOaid); // 建议 init 前
TDAdsSDK.setOpenPersonalizedAd(userAllowPersonalized); // 用户关闭个性化 → false

TDAdsSDK.initSdk(context, appId, new TDInitListener() { ... });

// 用户拒绝时才：TDAdsSDK.setPrivacyUserAgree(false);
// 再 load / show 广告
```

### 4.3 iOS 示例

```objc
[TDAdsSDK deniedUploadDeviceInfo:@[TDPrivacyKeyLocation, TDPrivacyKeyAppInstallList]];
[TDAdsSDK setPrivacyController:[TDPrivacyController new]];
[TDAdsSDK setAuthUID:userAllowIdfa]; // 建议 init 前；ATT 未授权仍无 IDFA
[TDAdsSDK setOpenPersonalizedAd:userAllowPersonalized];

[TDAdsSDK initSdkWithAppId:appId listener:listener];
// 用户拒绝时才：[TDAdsSDK setPrivacyUserAgree:NO];
```

### 4.4 字段常量（节选）

`LOCATION` · `OAID` · `IDFA` · `ANDROID_ID` · `IMEI` · `IMSI` · `MAC` · `MODEL` · `OS_VERSION` · `SCREEN` · `WIFI_STATE` · `APP_INSTALL_LIST` · `SENSOR` · `STORAGE` · …

完整列表见 `TDPrivacyDeviceInfo`（Android）/ `TDPrivacyDeviceInfo.h`（iOS）。

### 4.5 与 ADN CustomController 的关系

- 宿主优先用 TD 统一 API；`TDPrivacyController` 默认委托 `TDPrivacy`。
- 一期三源桥（JDSDK / DuskAd / AdGain）及后续直连 Adapter **初始化 ADN 前**读取 `TDAdsSDK.getPrivacyController()` / `privacyController`，映射到对方 `canUse*`。
- 关闭个性化后，Adapter 须调用对方限制个性化接口（若 ADN 支持）。
- OAID（Android）/ IDFA（iOS）下传：允许采时优先宿主 `getDevOaid` / `customIdfa`，其次 SDK 已采值。Android 在 `setAuthUID(true)` 后按厂商采集（对齐 TradPlus OaidUtil），再回落 `Android_CN_OAID`。iOS 在 `setAuthUID(true)` 后读系统 IDFA 并缓存（对齐 Android collector）；须 ATT 已授权，SDK 不代弹。都没有则不塞空串，由 ADN 自采。
- **JinDai、AdGain 依赖 OAID（Android）/ IDFA（iOS），否则不出广告。** 这是对方源填充条件。LiteMob / Sigmob 有值才传；Mintegral 无必须传接口。禁止采时传空，避免对方再采。宿主对接见 [初始化与隐私](./04_初始化与隐私.md)。

### 4.6 iOS IDFA / ATT（对照 TradPlus 官方）

TradPlus iOS 国内合规页强调：宿主在 **init 前**申请跟踪授权，并配置 `NSUserTrackingUsageDescription`；个性化用 `setOpenPersonalizedAd`（默认开、不持久化）。TradPlus iOS **没有** `setAuthUID`。

TD 为双端同一套命名：iOS 也提供 `setAuthUID`，语义是「宿主允许 SDK 读 IDFA」。要真正采到 IDFA，仍须：

```objc
#import <AppTrackingTransparency/AppTrackingTransparency.h>

// Info.plist: NSUserTrackingUsageDescription
if (@available(iOS 14, *)) {
    [ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) {
        [TDAdsSDK setAuthUID:(status == ATTrackingManagerAuthorizationStatusAuthorized)];
        [TDAdsSDK initSdkWithAppId:appId listener:listener];
    }];
} else {
    [TDAdsSDK setAuthUID:YES];
    [TDAdsSDK initSdkWithAppId:appId listener:listener];
}
```

SDK **不代弹** ATT。未授权、用户关 `setAuthUID`、关个性化或禁报 `IDFA` 时，上报空串。

---

## 5. 权限使用（T/TAF §5.3）

| 权限 | 可选/必选 | 用途 | 申请时机 |
|------|-----------|------|----------|
| 网络 | 必选 | 广告请求 | 同意后、业务需要时 |
| 定位（粗/精） | 可选 | 区域策略（可选能力） | 同意后，且仅当未禁报 LOCATION、业务需要时由宿主申请 |
| 读写存储 | 可选 | 下载类广告素材 | 同意后、相关广告场景 |
| ATT（iOS） | 可选 | IDFA | 同意后由宿主按需申请（`ATTrackingManager`，建议 init 前）；受 `setAuthUID` 约束 |

SDK **不蹭**宿主已申请但未声明给 SDK 用途的权限；用户拒权不阻断无关广告能力，不频繁弹窗。

---

## 6. 隐私政策披露模板（宿主可直接改编）

| 项 | 内容 |
|----|------|
| SDK 名称 | TD 聚合 SDK（TD Ads SDK） |
| 主体 | （填写贵司主体全称） |
| 使用目的 | 广告聚合变现、监测归因、反作弊、填充策略 |
| 处理个人信息 | 设备信息（OAID/IDFA 等可变标识、型号、OS、分辨率等）、网络信息（IP、网络类型）、广告行为数据；可选：位置、安装列表等（受宿主开关控制） |
| 收集方式 | SDK 自行采集 / 宿主透传 |
| 隐私政策链接 | （填写 TD SDK 隐私政策 URL） |
| 第三方 | 按实际接入披露 JDSDK / DuskAd / AdGain 及后续 ADN，附各方隐私链接 |

---

## 7. 最终用户权利与撤回

| 权利 | 宿主侧 | SDK 配合 |
|------|--------|----------|
| 撤回同意 | 设置页提供入口 | `setPrivacyUserAgree(false)` + 字段禁报 + 可停止请求广告 |
| 关闭个性化 | 设置页开关 | `setOpenPersonalizedAd(false)`，下次 load 生效 |
| 关闭标识采集 | 设置页开关 | `setAuthUID(false)` / `deniedUploadDeviceInfo(OAID/IDFA)` |

个性化状态 **SDK 不落盘**，宿主自行持久化用户选择并在每次启动重设。

---

## 8. 功能点 ID（工程追踪）

| ID | 说明 | 分期 |
|----|------|------|
| F-INIT-009 | `setAuthUID`：允许后 **真正采集** OAID（Android 厂商 + CN_OAID）/ IDFA（iOS 系统标识，须 ATT）；默认关；`resolve*ForAdn` 不塞空串 | 一期 |
| F-INIT-010 | `setOpenPersonalizedAd` 个性化广告开关 | 一期 |
| F-INIT-016 | `setPrivacyUserAgree` 国内隐私总控 | **一期**（原三期上提） |
| F-INIT-027 | `deniedUploadDeviceInfo` 字段级禁报 | 一期 |
| F-INIT-028 | `TDPrivacyController` ADN 透传 | 一期 |

海外 GDPR/CCPA/COPPA/LGPD 仍归 **三期**（F-INIT-007/008/017）。

---

## 9. Demo 验证入口（对内 / 对外）

| 端 | 对内 | 对外 |
|----|------|------|
| Android | `project/android/td-demo` | `project/demo/android/tdsdkdemo` |
| iOS | `project/ios` → TDAdsDemo | `project/demo/ios` |

对内首页含：隐私弹窗、同意开关、`setOpenPersonalizedAd` / `setAuthUID`（OAID·IDFA，**开关默认开**）、禁报位置与安装列表；未同意禁止 Init。SDK 本身 `setAuthUID` 默认关，与 Demo 开关默认不同。  
对外首页**不展示**合规开关；点初始化时按默认同意调用 `applyBeforeInit` / `applyAfterInit`（含 AuthUID 开），方便看广告。正式 App 须弹自己的隐私政策后再 Init。

## 10. 自测清单

- [ ] 未同意隐私政策前不调用 `initSdk`
- [ ] `setOpenPersonalizedAd(false)` 后 ADN 侧个性化关闭（打日志或对方调试工具确认）
- [ ] `setAuthUID(true)` 后 Android 走厂商采集（或 CN_OAID）；iOS ATT 授权后 `resolveIdfaForAdn` 有值（未授权为 nil，不传 `""`）
- [ ] `deniedUploadDeviceInfo(OAID)` / `setAuthUID(false)` 后 Open/业务请求无 OAID/IDFA
- [ ] `setPrivacyUserAgree(false)` 后位置/安装列表等不可用
- [ ] IMEI/IMSI/MAC 默认不上报
- [ ] 拒可选信息后仍可展示与该信息无关的广告
- [ ] 隐私政策含 TD + 第三方清单与可点击链接
- [ ] 对内 Demo 首页开关与弹窗可操作；对外 Demo 无合规 UI，Init 仍走默认同意
