# TD SDK 对接文档

> 文档版本：**1.1.6**  
> SDK 版本：Android / iOS **`1.1.2.7`**

欢迎使用 TD 聚合 SDK。按下面顺序接入激励、插屏、开屏、横幅、原生。

正式上线请使用后台为**您的应用**签发的 App ID、广告位 ID。正文示例一律写 `YOUR_APP_ID` / `YOUR_AD_UNIT_ID`。

隐私政策与字段禁报见 [隐私合规](#隐私合规)。

在线阅读：https://tydeonj.github.io/td-sdk-docs/

官方 Demo（对照用，正式包不要抄里面的广告位 ID）：

- Android：https://github.com/tydeonj/td-sdk-demo-android
- iOS：https://github.com/tydeonj/td-sdk-demo-ios

---

## 怎么读

| 您要做的 | 看哪一篇 |
| --- | --- |
| 开通后台、建应用 / 广告位 / 广告源 | [01 后台配置](#01-后台配置) |
| 把 SDK 编进 Android 工程 | [02 Android 集成](#02-android-集成) |
| 把 SDK 编进 iOS 工程 | [03 iOS 集成](#03-ios-集成) |
| 初始化、隐私开关、全局 API | [04 初始化与隐私](#04-初始化与隐私) |
| 接某一种广告 | [05](#05-激励视频)～[09](#09-原生广告) |
| 底价、尺寸、userId | [10 自定义参数与尺寸](#10-自定义参数与尺寸) |
| 回调字段、错误码 | [11 回调与错误码](#11-回调与错误码) |
| 怎么验集成成功 | [12 测试验收](#12-测试验收) |
| 常见问题 | [13 FAQ](#13-faq) |

Android 用 Maven，iOS 用 CocoaPods。

---

## 推荐顺序

1. [后台配置](#01-后台配置)：应用 → 广告位 → 广告源 → 瀑布流
2. 只看您的端：[Android 集成](#02-android-集成) 或 [iOS 集成](#03-ios-集成)
3. [初始化](#04-初始化与隐私)（用户同意隐私政策之后；仅主进程 / `didFinishLaunching`）
4. 按格式抄 Load → `isReady` → Show
5. [测试验收](#12-测试验收)

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
| 横幅 | `TDBanner` | 宽撑满、高 ≥50（JinDai 建议 ≥200） |
| 原生 | `TDNative` | ≥250；自渲染先打 TAG 再 Show |

---

下面是完整正文（与网页版同一套）。

# 01 后台配置

> 文档版本：1.1.5

本篇只讲后台。SDK 怎么 Load / Show 见后面各格式篇。

---

## 1. 获取账号与应用

### 操作

1. 联系 TD 运营开通后台账号，登录后进入【应用管理】。
2. 点击【添加应用】，填写：

| 应用信息 | 填写说明 |
| --- | --- |
| 平台 | Android 或 iOS。一个应用对应一个平台。 |
| 包名 / Bundle ID | 与实际上架包名一致，例如 `com.example.app`。 |
| 应用名称 | 应用真实名称。 |
| 一级 / 二级分类 | 游戏选【游戏】，其余选【应用】。 |

3. 保存后得到 **App ID**。初始化 SDK 时传入该 ID（代码里写成您自己的，不要写 Demo 数字）。

### 预期结果

【应用管理】列表能看到新建应用，并能复制 App ID。

---

## 2. 添加广告位

### 操作

1. 选中应用，点击【添加广告位】。
2. 按场景选类型。当前支持 5 类：激励、插屏、横幅、原生、开屏。
3. 保存后得到 **广告位 ID**（长整型）。类型建错会导致无法展示，例如用原生位去请求激励。

| 类型 | 后台填写说明 |
| --- | --- |
| 激励视频 | 名称必填。并行请求数初次可保持默认。奖励项目/数量可选，发奖以代码 `onAdReward` 为准。 |
| 插屏 | 名称必填。并行请求数初次可保持默认。 |
| 横幅 | 名称必填。若后台开自动刷新，请关闭三方后台的自动刷新，避免双边刷新。 |
| 原生 | 名称必填。在后台为该源选择**模板**或**自渲染**（须与三方广告位类型一致）。客户端看 Load 回调里的 `renderType`，见 [09 原生广告](#09-原生广告)。 |
| 开屏 | 名称必填。倒计时由广告平台控制。请在 `onAdClosed` 后进入首页。 |

### 预期结果

广告位列表可见新建位，并能复制广告位 ID。

---

## 3. 添加广告源、配置瀑布流

### 前提

1. 确定要接的广告平台与广告类型（如 JinDai 激励、LiteMob 开屏）。
2. 在各广告平台创建应用与广告位，拿到该平台要求的应用 ID、广告位 ID 等参数。填写时与三方后台逐项核对。

### 操作

1. 在广告位下【添加广告源】，按后台表单填写三方参数。
2. 保存后，为该广告位配置瀑布流。
3. 工程里只加后台实际用到的平台依赖，见 [02](#02-android-集成) / [03](#03-ios-集成)。

### 预期结果

该广告位下能看到已添加的广告源。客户端 `loadAd` 后：有填充走 `onAdLoaded`，无填充走 `onAdLoadFailed`。展示前用 `isReady` 判断。

---

## 4. 报表与测试位

- 需要拉取三方报表时，按后台【广告平台】授权（向运营确认各平台要填的 Key）。
- 联调用的测试广告位由运营提供，或使用示例工程自带配置（仅 Demo，见 [12 测试验收](#12-测试验收)）。

---

---

# 02 Android 集成

> 文档版本：1.1.6 · SDK `1.1.2.7`

先加 TD 核心，再按后台实际用到的平台补仓库和依赖。没接的平台不要加。只加了 TD 模块、没加官方 SDK，加载会失败（错误码 `1020`）。

对照工程：https://github.com/tydeonj/td-sdk-demo-android

---

## 1. 环境

| 项 | 说明 |
| --- | --- |
| AndroidX | 必须 |
| minSdk | 16 |
| Java | 8 及以上 |
| 初始化进程 | **仅主进程**（否则 `1002`） |
| 当前 SDK | `1.1.2.7` |

---

## 2. Maven 仓库（TD 必加）

TD 在 Maven Central。项目级 `build.gradle`（或 `settings.gradle` 的 `dependencyResolutionManagement`）：

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

广告源自己的仓库见第 4 节，接了哪个再加哪个。

---

## 3. TD 核心依赖（必加）

复制到 **app 模块** `dependencies`：

```groovy
def tdVer = '1.1.2.7'

implementation "com.tyedo:td-ads-base:${tdVer}"
implementation "com.tyedo:td-ads-sdk:${tdVer}"
```

---

## 4. 按需接入广告源

后台配了哪个平台，就加该平台的 **仓库 + TD 模块 + 官方 SDK**。三个都要有。

### JinDai

无需额外 Maven。把官方 `JDSDK-*.aar` 放到 `app/libs/`。

```groovy
implementation "com.tyedo:jdsdk_ads:${tdVer}"
implementation files('libs/JDSDK-3.80.9.aar')
```

### AdGain

仓库按 **AdGain 官方文档**配置（对方私有 Maven，账号向 AdGain 申请）。不要把账号密码写进工程或对外文档。

```groovy
implementation "com.tyedo:adgain_ads:${tdVer}"
implementation 'com.adgain:adgain-sdk:4.1.5'
```

**JinDai、AdGain 没有 OAID 不出广告。** `setAuthUID` 默认关，用户同意后、**init 前**打开，见 [04](#04-初始化与隐私)。LiteMob / Sigmob / Mintegral 不依赖这一条。

### LiteMob

```groovy
maven { url 'https://hub.litemob.com/api/v4/projects/2/packages/maven' }
```

```groovy
implementation "com.tyedo:ltmb_ads:${tdVer}"
implementation 'com.ltmb.ltsdk:core:2.9.5'
implementation 'com.github.bumptech.glide:glide:4.13.0'
implementation 'com.google.code.gson:gson:2.8.6'
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
implementation 'androidx.cardview:cardview:1.0.0'
```

工程里已有 Glide / Gson / OkHttp / CardView 可不再重复加。

---

## 5. AndroidManifest

至少：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

Android 13+ 若使用广告标识，按 Google 要求增加：

```xml
<uses-permission android:name="android.permission.AD_ID" />
```

已接平台若还要求定位、安装列表等，按该平台文档补，并在隐私弹窗里告知用户。各平台要求的 `meta-data` / `provider` 也按官方清单合并，TD 不代生成。

---

## 6. 混淆（R8）

开启 minify 时加入。Maven 接入一般会自动带 consumer 规则；混淆后加载失败，把下面整段补进应用 ProGuard。

**TD 核心（必加）**

```text
-keepattributes Signature,*Annotation*,InnerClasses,EnclosingMethod
-keep public class com.td.ads.open.** { *; }
-keep public interface com.td.ads.open.** { *; }
-keep public class com.td.ads.core.** { *; }
-keep public interface com.td.ads.core.** { *; }
-keep public class com.td.ads.base.** { *; }
-keep public interface com.td.ads.base.** { *; }
-keep public class com.td.ads.crash.** { *; }
-keepclassmembers class * extends com.td.ads.base.adapter.TDBaseAdapter {
    public <init>();
}
```

**接了哪个平台，再加哪一行**

```text
-keep public class com.td.ads.jdsdk.** { *; }
-keep public class com.td.ads.adgain.** { *; }
-keep public class com.td.ads.ltmb.** { *; }
```

各广告平台官方 SDK 的混淆规则，按该平台文档自行添加。

---

## 7. 下一步

[04 初始化与隐私](#04-初始化与隐私)（在 `Application.onCreate`、**主进程**调用）。

---

# 03 iOS 集成

> 文档版本：1.1.6 · SDK `1.1.2.7`

先加 TD 核心，再按后台实际用到的平台加 **TD 模块 + 官方 SDK**。没接的不要加。只加 TD 模块、没加官方 SDK，加载会失败（错误码 `1020`）。

对照工程：https://github.com/tydeonj/td-sdk-demo-ios

---

## 1. 环境

| 项 | 说明 |
| --- | --- |
| 最低系统 | iOS 12.0（接 LiteMob 时宿主 **≥ 12.2**） |
| Xcode | 14 及以上 |
| 接入 | CocoaPods，`use_frameworks! :linkage => :static` |
| Other Linker Flags | **必须** `-ObjC`（保留 `$(inherited)`） |
| 当前 SDK | `1.1.2.7` |

---

## 2. TD 核心（必加）

工程根目录 `Podfile`：

```ruby
platform :ios, '12.0'
use_frameworks! :linkage => :static

target 'YourApp' do
  pod 'TDAdsBase', '1.1.2.7'
  pod 'TDAdsSDK',  '1.1.2.7'
end
```

`pod install` 后用 `.xcworkspace` 打开。

---

## 3. 按需接入广告源

### JinDai

```ruby
pod 'TDAdsJDSDK', '1.1.2.7'
pod 'JinDaiSDK', :subspecs => ['JinDaiSDK']
```

下游 subspec 按 JinDai 官方文档按需补。

### AdGain

```ruby
pod 'TDAdsAdGain', '1.1.2.7'
pod 'AdGainSDK', '4.2.8.2'
```

Trunk 若尚未收录该版本，按 AdGain 官方仓库把 SDK 放到本地后 `:path` 引入（不要把账号写进文档）。Android 对方 SDK 版本跟 AdGain Android 官方，与 iOS 版本号可以不同。

**JinDai、AdGain 没有 IDFA 不出广告。** 须 ATT 授权；`setAuthUID` 默认关，用户同意后、**init 前**打开，见 [04](#04-初始化与隐私)。

### LiteMob

```ruby
pod 'TDAdsLtmb', '1.1.2.7'
pod 'LitemobSDK', '~> 5.5'
```

Litemob 是动态库，检查 **Embed & Sign**。纯 ObjC 工程加一个空 `Dummy.swift`。接 Litemob 时：**Deployment Target ≥ 12.2**，**Always Embed Swift Standard Libraries = NO**，`LD_RUNPATH_SEARCH_PATHS` 把 `/usr/lib/swift` 放最前。否则真机可能 SIGABRT。核心 TD 仍支持 iOS 12.0。

---

## 4. 工程配置（上架必做）

### 4.1 Other Linker Flags

Build Settings → Other Linker Flags 增加 `-ObjC`。接部分官方 SDK 时还可能需要 `-lc++` 等，以该平台文档为准。

### 4.2 ATS

广告素材可能走非 HTTPS。`Info.plist` 增加：

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

上线前按苹果审核要求收紧例外域。

### 4.3 ATT（要采 IDFA 时）

1. `Info.plist` 增加 `NSUserTrackingUsageDescription` 及面向用户的说明文案。
2. **init 之前**调用 `ATTrackingManager requestTrackingAuthorization`。TD SDK **不代弹** ATT。
3. 用户未允许时读到的 IDFA 无效，JinDai / AdGain 可能无填充。

### 4.4 SKAdNetwork

在 `Info.plist` 的 `SKAdNetworkItems` 中，**只合并已接平台**的官方 SKAdNetwork ID。示例工程里的列表是模板，不能原样上线。各平台 ID 以该平台当前文档为准。

### 4.5 PrivacyInfo.xcprivacy

已接平台若带 `PrivacyInfo.xcprivacy`，合并进您的 App 清单，不要重复同一 API 条目。

---

## 5. 头文件

```objc
#import <TDAdsSDK/TDAdsSDK.h>
#import <TDAdsSDK/TDReward.h>          // 以及 TDInterstitial / TDSplash / TDBanner / TDNative
#import <TDAdsSDK/TDRewardListener.h>  // 以及对应 Listener
#import <TDAdsBase/TDError.h>
#import <TDAdsBase/TDNativeMaterial.h>
```

---

## 6. 下一步

[04 初始化与隐私](#04-初始化与隐私)（在 `application:didFinishLaunchingWithOptions:` 中、用户同意后再 Init）。

---

# 04 初始化与隐私

> 文档版本：1.1.5

创建任何一个广告位对象前，必须先初始化。请先让用户同意您自己的《隐私政策》，再 Init。TD **不代弹**隐私窗，也不代弹 ATT。

完整字段与合规披露见 [隐私合规](#隐私合规)。

---

## 1. 时机

| | Android | iOS |
| --- | --- | --- |
| 建议位置 | `Application.onCreate`，**仅主进程** | `application:didFinishLaunchingWithOptions:` |
| App ID | 后台签发的 `YOUR_APP_ID` | 同左（iOS 应用另有独立 App ID） |
| 重复 Init | 已初始化会直接 `onSuccess`；进行中会排队，完成后一起回调 | 同左 |
| 空 AppId / 空 Context | `onFailed`（1001），不会抛异常 | `onFailed`（1001），不会抛异常 |
| 失败重试 | 不要在 `onFailed` 里立刻重试，自行控制间隔 | 同左 |

接了竞价源时尽早 Init，再请求开屏，避免配置还没拉下来就 Load。

---

## 2. Android

```java
import com.td.ads.open.TDAdsSDK;
import com.td.ads.open.TDInitListener;
import com.td.ads.base.common.TDError;

public class YourApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        if (/* 非主进程 */) return;
        // 用户已同意隐私政策之后：
        TDAdsSDK.setAuthUID(this, true); // 默认关；接 JinDai/AdGain 需要 OAID 时打开
        TDAdsSDK.initSdk(this, "YOUR_APP_ID", new TDInitListener() {
            @Override public void onSuccess() { }
            @Override public void onFailed(TDError error) { }
        });
    }
}
```

请传入 Application。App ID 或 Context 为空时走 `onFailed`，不要依赖崩溃来发现配错。

---

## 3. iOS

```objc
#import <TDAdsSDK/TDAdsSDK.h>
#import <TDAdsSDK/TDInitListener.h>
#import <AppTrackingTransparency/AppTrackingTransparency.h>

- (BOOL)application:(UIApplication *)application
didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // 用户已同意隐私政策之后；需要 IDFA 时先 ATT，再：
    [TDAdsSDK setAuthUID:YES]; // 默认关
    [TDAdsSDK initSdkWithAppId:@"YOUR_APP_ID" listener:self];
    return YES;
}

- (void)onSuccess { /* 可创建广告位对象 */ }
- (void)onFailed:(TDError *)error { }
```

App ID 为空时走 `onFailed`。ATT 在 init 前申请；SDK 不代弹。

---

## 4. 全局 API

| 说明 | Android | iOS |
| --- | --- | --- |
| 初始化 | `TDAdsSDK.initSdk(context, appId, listener)` | `[TDAdsSDK initSdkWithAppId:appId listener:]` |
| 是否已 Init | `isInit()` | `isInit` |
| 版本号 | `getSdkVersion()` | `sdkVersion` |
| 全局自定义参数 | `setCustomMap` | `setCustomMap:` |
| 动态底价（分） | `setBidFloor(adUnitId, fen)` | `setBidFloor:adUnitId priceFen:` |
| 广告位自定义参数 | `setCustomParams(adUnitId, map)` | `setCustomParams:adUnitId map:` |
| 覆盖请求尺寸 | `setAdSize(adUnitId, w, h)` | `setAdSize:adUnitId width:height:` |
| 允许采 OAID / IDFA | `setAuthUID`，**默认关** | 同名。建议 init 前。iOS 仍须 ATT |
| 个性化广告 | `setOpenPersonalizedAd`，默认开、不持久化 | 同左。关后不再采 OAID/IDFA |
| 隐私总控 | `setPrivacyUserAgree` | 同左。**默认开，不必调用。** 仅用户拒绝时传 `false` |
| 字段禁报 | `deniedUploadDeviceInfo` | 同左。建议 init 前 |
| 调试日志 | `setDebugMode(true)`，上线请关 | 同左 |
| 清除缓存 | `clearCache(adUnitId)` | `clearCache:` |

`setPrivacyUserAgree(true)` **不是必调步骤**。默认就是开。

---

## 5. OAID / IDFA（接 JinDai、AdGain 时）

这两家源没有标识会不出广告，是对方填充条件，不是 TD 另加的开关。Android 传 OAID，iOS 传 IDFA。LiteMob / Sigmob 有值才下传；Mintegral 无「必须传」接口。

采集须同时满足：

- `setAuthUID(true)`（默认关）
- 隐私总控未关（默认开，**不必**再调 `setPrivacyUserAgree(true)`）
- `setOpenPersonalizedAd` 未关
- 该字段未被 `deniedUploadDeviceInfo` 禁报
- iOS 还须 ATT 已授权

允许采时：优先宿主传入的 OAID/IDFA，其次 SDK 已缓存值。都没有则**不塞空串**。禁止采时才传空，避免对方再采。

SDK 的 `setAuthUID` **默认关**。正式 App 按用户授权调用，不要为了出广告在示例里写死 `true` 就上线。

---

## 6. 下一步

按格式：[05 激励](#05-激励视频) · [06 插屏](#06-插屏广告) · [07 开屏](#07-开屏广告) · [08 横幅](#08-横幅广告banner) · [09 原生](#09-原生广告)

---

# 05 激励视频

> 文档版本：1.1.5

全屏 15–30 秒视频。看完后在 `onAdReward` 里发奖。请提前 `loadAd`，`isReady` 为 true 再 Show。不要在 `onAdLoaded` 里立刻 Show。

离开页面调用 `onDestroy()`。失败后不要立刻再 `loadAd`；必须重试时自行控制间隔。上一轮未结束再次 `loadAd` 会走 `onAdIsLoading`。

Android 创建和展示建议传 `Activity`。

---

## API

| | Android | iOS |
| --- | --- | --- |
| 创建（仅一次） | `new TDReward(Context, long)` | `[[TDReward alloc] initWithAdUnitId:]` |
| 请求 | `loadAd()` | `loadAd` |
| 可展 | `isReady()` | `isReady` |
| 展示 | `showAd(Activity, sceneId)` | `showAdFrom:sceneId:` |
| 当前广告 | `getAdInfo()` | `getAdInfo` |
| 底价 / 参数 / 释放 | `setBidFloor` / `setCustomParams` / `onDestroy` | 同左 |

激励请传登录用户 ID（`setCustomParams` 的 `userId`，或 `setRewardVerify`）。部分平台不传会展示失败。`sceneId` 可选。

---

## 回调 `TDRewardListener`

| 方法 | 说明 |
| --- | --- |
| `onAdLoaded` | 有可展示广告 |
| `onAdLoadFailed` | 加载失败 |
| `onAdIsLoading` | 上一轮未结束 |
| `onAdImpression` | 展示 |
| `onAdShowFailed` | 展示失败 |
| `onVideoStart` / `onVideoComplete` | 视频开始 / 播完 |
| `onAdClicked` | 点击 |
| `onAdReward` | **在此发奖** |
| `onAdClosed` | 关闭 |
| `onAdAllLoaded` | 本轮结束；`true` 表示有填充 |
| `onBiddingStart` / `onBiddingEnd` | 竞价开始 / 结束；成功时 error 为空 |
| `onAdLoadStart` / `onAdLoadEnd` | 可选，可不实现 |

典型顺序：`Loaded` → `Impression` → `VideoStart` → `VideoComplete` → `Reward` → `Close`。

---

## 示例

**Android**

```java
TDReward reward = new TDReward(this, YOUR_AD_UNIT_ID);
Map<String, Object> extra = new HashMap<>();
extra.put("userId", "your_app_user_id");
reward.setCustomParams(extra);
reward.setAdListener(new TDRewardListener() {
    @Override public void onAdLoaded(TDAdInfo info) { }
    @Override public void onAdLoadFailed(TDError error) { }
    @Override public void onAdIsLoading() { }
    @Override public void onAdImpression(TDAdInfo info) { }
    @Override public void onAdShowFailed(TDError error) { }
    @Override public void onVideoStart(TDAdInfo info) { }
    @Override public void onVideoComplete(TDAdInfo info) { }
    @Override public void onAdClicked(TDAdInfo info) { }
    @Override public void onAdReward(TDAdInfo info) { /* 发奖 */ }
    @Override public void onAdClosed(TDAdInfo info) { }
    @Override public void onAdAllLoaded(boolean ok) { }
    @Override public void onBiddingStart(TDAdInfo info) { }
    @Override public void onBiddingEnd(TDAdInfo info, TDError error) { }
});
reward.loadAd();
if (reward.isReady()) {
    reward.showAd(this, "your_scene");
}
```

**iOS**（类实现 `TDRewardListener`）

```objc
self.reward = [[TDReward alloc] initWithAdUnitId:YOUR_AD_UNIT_ID];
[self.reward setCustomParams:@{ @"userId": @"your_app_user_id" }];
[self.reward setAdListener:self];
[self.reward loadAd];
if ([self.reward isReady]) {
    [self.reward showAdFrom:self sceneId:@"your_scene"];
}
```

```objc
- (void)onAdLoaded:(TDAdInfo *)info { }
- (void)onAdLoadFailed:(TDError *)error { }
- (void)onAdIsLoading { }
- (void)onAdImpression:(TDAdInfo *)info { }
- (void)onAdShowFailed:(TDError *)error { }
- (void)onVideoStart:(TDAdInfo *)info { }
- (void)onVideoComplete:(TDAdInfo *)info { }
- (void)onAdClicked:(TDAdInfo *)info { }
- (void)onAdReward:(TDAdInfo *)info { /* 发奖 */ }
- (void)onAdClosed:(TDAdInfo *)info { }
- (void)onAdAllLoaded:(BOOL)ok { }
- (void)onBiddingStart:(TDAdInfo *)info { }
- (void)onBiddingEnd:(TDAdInfo *)info error:(TDError *)error { }
```

---

# 06 插屏广告

> 文档版本：1.1.5

全屏图片或视频，适合关卡切换、返回首页。提前加载，`isReady` 再 Show。不需要容器。注意事项与激励相同：失败不要立刻重试；离开页面 `onDestroy`。

---

## API

| | Android | iOS |
| --- | --- | --- |
| 创建 | `new TDInterstitial(Context, long)` | `initWithAdUnitId:` |
| 加载 / 可展 | `loadAd()` / `isReady()` | `loadAd` / `isReady` |
| 展示 | `showAd(Activity, sceneId)` | `showAdFrom:sceneId:` |
| 当前广告 | `getAdInfo()` | `getAdInfo` |
| 其它 | `setBidFloor` / `setCustomParams` / `clearCache` / `onDestroy` | 同左 |

---

## 回调 `TDInterstitialListener`

| 方法 | 说明 |
| --- | --- |
| `onAdLoaded` | 加载成功 |
| `onAdLoadFailed` | 加载失败 |
| `onAdIsLoading` | 上一轮未结束 |
| `onAdImpression` | 展示 |
| `onAdShowFailed` | 展示失败 |
| `onAdClicked` | 点击 |
| `onAdClosed` | 关闭 |
| `onAdAllLoaded` | 本轮结束 |
| `onBiddingStart` / `onBiddingEnd` | 竞价 |
| `onAdLoadStart` / `onAdLoadEnd` | 可选 |

---

## 示例

**Android**

```java
TDInterstitial ad = new TDInterstitial(this, YOUR_AD_UNIT_ID);
ad.setAdListener(new TDInterstitialListener() {
    @Override public void onAdLoaded(TDAdInfo info) { }
    @Override public void onAdLoadFailed(TDError error) { }
    @Override public void onAdIsLoading() { }
    @Override public void onAdImpression(TDAdInfo info) { }
    @Override public void onAdShowFailed(TDError error) { }
    @Override public void onAdClicked(TDAdInfo info) { }
    @Override public void onAdClosed(TDAdInfo info) { }
    @Override public void onAdAllLoaded(boolean ok) { }
    @Override public void onBiddingStart(TDAdInfo info) { }
    @Override public void onBiddingEnd(TDAdInfo info, TDError error) { }
});
ad.loadAd();
if (ad.isReady()) ad.showAd(this, "your_scene");
```

**iOS**

```objc
self.interstitial = [[TDInterstitial alloc] initWithAdUnitId:YOUR_AD_UNIT_ID];
[self.interstitial setAdListener:self];
[self.interstitial loadAd];
if ([self.interstitial isReady]) {
    [self.interstitial showAdFrom:self sceneId:@"your_scene"];
}
```

```objc
- (void)onAdLoaded:(TDAdInfo *)info { }
- (void)onAdLoadFailed:(TDError *)error { }
- (void)onAdIsLoading { }
- (void)onAdImpression:(TDAdInfo *)info { }
- (void)onAdShowFailed:(TDError *)error { }
- (void)onAdClicked:(TDAdInfo *)info { }
- (void)onAdClosed:(TDAdInfo *)info { }
- (void)onAdAllLoaded:(BOOL)ok { }
- (void)onBiddingStart:(TDAdInfo *)info { }
- (void)onBiddingEnd:(TDAdInfo *)info error:(TDError *)error { }
```

---

# 07 开屏广告

> 文档版本：1.1.5

应用打开后展示 3–5 秒。请先完成 Init，再尽早 Load。容器必须接近全屏；过小会无法展示。

- Android：容器用 `INVISIBLE` 占位，不要 `GONE`。展示前等一帧（`post()`）。
- iOS：可用 `alpha=0` 占位，展示前设为 `1` 并 `layoutIfNeeded`。
- 在 `onAdClosed`、`onAdShowFailed` 里收起开屏，再进首页。

冷启动时配置可能还没拉下来。Init 成功后再 Load；不要在 Init 回调前抢请求。

---

## API

| | Android | iOS |
| --- | --- | --- |
| 创建 | `new TDSplash(Context, long)` | `initWithAdUnitId:` |
| 请求 | `loadAd()`。不设尺寸时按整屏 | 同左 |
| 覆盖尺寸 | `setAdSize(w, h)` | `setAdSize:height:` |
| 容器 | Show 时传入 | Load 前可 `setContainer:` |
| 展示 | `showAd(Activity, ViewGroup, sceneId)` | `showAdFrom:container:sceneId:` |
| 当前广告 | `getAdInfo()` | `getAdInfo` |
| 其它 | `isReady` / `onDestroy` / `clearCache` | 同左 |

---

## 回调 `TDSplashListener`

与插屏相同：`onAdLoaded` / `onAdLoadFailed` / `onAdIsLoading` / `onAdImpression` / `onAdClicked` / `onAdClosed` / `onAdShowFailed` / `onAdAllLoaded` / Bidding / 可选 LoadStart、LoadEnd。

---

## 示例

**Android**

```xml
<FrameLayout
    android:id="@+id/splash_overlay"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#FF000000"
    android:clickable="true"
    android:visibility="invisible" />
```

```java
TDSplash splash = new TDSplash(this, YOUR_AD_UNIT_ID);
splash.setAdListener(new TDSplashListener() {
    @Override public void onAdLoaded(TDAdInfo info) { }
    @Override public void onAdLoadFailed(TDError error) { }
    @Override public void onAdIsLoading() { }
    @Override public void onAdImpression(TDAdInfo info) { }
    @Override public void onAdShowFailed(TDError error) { hideSplash(); }
    @Override public void onAdClicked(TDAdInfo info) { }
    @Override public void onAdClosed(TDAdInfo info) { hideSplash(); /* 进首页 */ }
    @Override public void onAdAllLoaded(boolean ok) { }
    @Override public void onBiddingStart(TDAdInfo info) { }
    @Override public void onBiddingEnd(TDAdInfo info, TDError error) { }
});
splash.loadAd();
if (splash.isReady()) {
    splashOverlay.setVisibility(View.VISIBLE);
    splashOverlay.post(() -> splash.showAd(this, splashOverlay, "your_scene"));
}
```

**iOS**

```objc
self.splashOverlay = [UIView new];
self.splashOverlay.alpha = 0;
self.splashOverlay.userInteractionEnabled = NO;
self.splashOverlay.backgroundColor = UIColor.blackColor;
self.splashOverlay.translatesAutoresizingMaskIntoConstraints = NO;
[self.view addSubview:self.splashOverlay];
[NSLayoutConstraint activateConstraints:@[
    [self.splashOverlay.topAnchor constraintEqualToAnchor:self.view.topAnchor],
    [self.splashOverlay.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
    [self.splashOverlay.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
    [self.splashOverlay.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
]];

self.splash = [[TDSplash alloc] initWithAdUnitId:YOUR_AD_UNIT_ID];
[self.splash setAdListener:self];
[self.splash setContainer:self.splashOverlay];
[self.splash loadAd];
if ([self.splash isReady]) {
    self.splashOverlay.alpha = 1;
    self.splashOverlay.userInteractionEnabled = YES;
    [self.view layoutIfNeeded];
    [self.splash showAdFrom:self container:self.splashOverlay sceneId:@"your_scene"];
}
```

`onAdClosed` / `onAdShowFailed` 里移除 overlay 子 View，再 `alpha=0`，然后进首页。

---

# 08 横幅广告（Banner）

> 文档版本：1.1.5

适合页面顶或底。容器宽度撑满，高度至少 50dp / 50pt。不设尺寸时按屏宽 × 50 请求。

**JinDai Banner** 官方高为自适应。容器不要锁死 50dp，否则素材被压扁；建议 ≥200dp。

`onAdClosed` 后请从容器移除 Banner（Android `removeAllViews`，iOS 去掉子 View）。SDK 不会替你拆容器。离开页面 `onDestroy`。

AdGain 无 Banner API，该源会 `formatUnsupported`。

---

## API

| | Android | iOS |
| --- | --- | --- |
| 创建 | `new TDBanner(Context, long)` | `initWithAdUnitId:` |
| 请求 | `loadAd()` | `loadAd` |
| 覆盖尺寸 | `setAdSize(widthPx, heightPx)` | `setAdSize:height:` |
| 容器 | Show 时传入 | Load 前可 `setContainer:` |
| 展示 | `showAd(Activity, ViewGroup, sceneId)` | `showAdFrom:container:sceneId:` |
| 当前广告 | `getAdInfo()` | `getAdInfo` |
| 其它 | `isReady` / `onDestroy` / `clearCache` | 同左 |

回调 `TDBannerListener`：Loaded / Fail / IsLoading / Impression / Click / Close / ShowFail / AllLoaded / Bidding。

---

## 示例

**Android**（JinDai 建议高度 200dp）

```xml
<FrameLayout
    android:id="@+id/ad_container"
    android:layout_width="match_parent"
    android:layout_height="200dp"
    android:visibility="visible" />
```

```java
TDBanner banner = new TDBanner(this, YOUR_AD_UNIT_ID);
banner.setAdListener(new TDBannerListener() {
    @Override public void onAdLoaded(TDAdInfo info) { }
    @Override public void onAdLoadFailed(TDError error) { }
    @Override public void onAdIsLoading() { }
    @Override public void onAdImpression(TDAdInfo info) { }
    @Override public void onAdShowFailed(TDError error) { }
    @Override public void onAdClicked(TDAdInfo info) { }
    @Override public void onAdClosed(TDAdInfo info) { container.removeAllViews(); }
    @Override public void onAdAllLoaded(boolean ok) { }
    @Override public void onBiddingStart(TDAdInfo info) { }
    @Override public void onBiddingEnd(TDAdInfo info, TDError error) { }
});
banner.loadAd();
if (banner.isReady()) {
    banner.showAd(this, container, "your_scene");
}
```

**iOS**

```objc
self.adContainer = [UIView new];
self.adContainer.translatesAutoresizingMaskIntoConstraints = NO;
[self.view addSubview:self.adContainer];
[self.adContainer.heightAnchor constraintEqualToConstant:200].active = YES;
// leading / trailing 撑满

self.banner = [[TDBanner alloc] initWithAdUnitId:YOUR_AD_UNIT_ID];
[self.banner setAdListener:self];
[self.banner setContainer:self.adContainer];
[self.banner loadAd];
if ([self.banner isReady]) {
    [self.banner showAdFrom:self container:self.adContainer sceneId:@"your_scene"];
}
```

```objc
- (void)onAdLoaded:(TDAdInfo *)info { }
- (void)onAdLoadFailed:(TDError *)error { }
- (void)onAdIsLoading { }
- (void)onAdImpression:(TDAdInfo *)info { }
- (void)onAdShowFailed:(TDError *)error { }
- (void)onAdClicked:(TDAdInfo *)info { }
- (void)onAdClosed:(TDAdInfo *)info {
    for (UIView *sub in [self.adContainer.subviews copy]) [sub removeFromSuperview];
}
- (void)onAdAllLoaded:(BOOL)ok { }
- (void)onBiddingStart:(TDAdInfo *)info { }
- (void)onBiddingEnd:(TDAdInfo *)info error:(TDError *)error { }
```

---

# 09 原生广告

> 文档版本：1.1.5

嵌在信息流中。容器宽撑满，高至少 250dp / 250pt。不设尺寸时按屏宽 × 250 请求。

**SDK 不会在 Load 后自动 Show。** `onAdLoaded` 只带回 `renderType` 和素材。和激励一样，再调 Show。

后台把该源配成模板或自渲染，须与三方广告位类型一致。客户端以 `info.renderType` 为准：

| renderType | 值 | 您要做的 |
| --- | --- | --- |
| 模板 `EXPRESS` | `1` | 不要往容器塞自己的布局，直接 Show |
| 自渲染 `SELF_RENDER` | `2` | Show **之前**用 `nativeMaterial` 拼 title / desc / cta / 主图，打上 TAG |
| 未知 | `-1` | 尚未 Load 或非原生 |

自渲染可在 `onAdLoaded` 拼，也可紧挨 Show 前拼。官方 Demo 在点 Show 时拼，避免 Load 后容器里已有文案看起来像自动展示。空容器 Show 会失败（`1001`）。

iOS 的 `UILabel` 默认不可点，必须 `userInteractionEnabled = YES`。`onAdClosed` 后请从容器移除广告 View。模板自带关闭钮时点关闭会 `onAdClosed`；自渲染一般由宿主自己拆容器。

素材字段由 SDK 从各平台映射到 `nativeMaterial`。宿主只需按 TAG 拼装。

---

## 自渲染 TAG（必须）

| 用途 | 值 | Android `setTag` | iOS `accessibilityIdentifier` |
| --- | --- | --- | --- |
| 标题 | `td_title` | `TDNativeMaterial.TAG_TITLE` | `TDNativeMaterial.tagTitle` |
| 描述 | `td_desc` | `TDNativeMaterial.TAG_DESC` | `TDNativeMaterial.tagDesc` |
| 按钮 | `td_cta` | `TDNativeMaterial.TAG_CTA` | `TDNativeMaterial.tagCta` |
| 图标 | `td_icon` | `TAG_ICON` | `tagIcon` |
| 主图 | `td_image` | `TAG_IMAGE` | `tagImage` |

未打 TAG 时，容器及其直接子 View 作为可点区域。

---

## API

| | Android | iOS |
| --- | --- | --- |
| 创建 | `new TDNative(Context, long)` | `initWithAdUnitId:` |
| 请求 | `loadAd()` | `loadAd` |
| 覆盖尺寸 | `setAdSize(w, h)` | `setAdSize:height:` |
| 展示 | `showAd(Activity, ViewGroup, sceneId)` | `showAdFrom:container:sceneId:` |
| 模板展示 | `showAd(Activity, ViewGroup, layoutRes, sceneId)` | `showAdFrom:container:nibName:bundle:sceneId:` |
| 当前广告 | `getAdInfo()` | `getAdInfo` |

`TDAdInfo.nativeMaterial`：`title` / `desc` / `cta` / `iconUrl` / `imageUrl`。

- Android：`TDRenderType.EXPRESS` = 1，`SELF_RENDER` = 2
- iOS：`TDRenderTypeExpress` = 1，`TDRenderTypeSelfRender` = 2

回调与 Banner 相同一套 Loaded / Fail / Impression / Click / Close / ShowFail / AllLoaded / Bidding。

---

## 示例（自渲染在 Show 前拼）

**Android**

```java
TDNative nativeAd = new TDNative(this, YOUR_AD_UNIT_ID);
final TDAdInfo[] pending = new TDAdInfo[1];
nativeAd.setAdListener(new TDNativeListener() {
    @Override public void onAdLoaded(TDAdInfo info) { pending[0] = info; }
    @Override public void onAdLoadFailed(TDError error) { }
    @Override public void onAdIsLoading() { }
    @Override public void onAdImpression(TDAdInfo info) { }
    @Override public void onAdShowFailed(TDError error) { }
    @Override public void onAdClicked(TDAdInfo info) { }
    @Override public void onAdClosed(TDAdInfo info) { container.removeAllViews(); }
    @Override public void onAdAllLoaded(boolean ok) { }
    @Override public void onBiddingStart(TDAdInfo info) { }
    @Override public void onBiddingEnd(TDAdInfo info, TDError error) { }
});
nativeAd.loadAd();

// 产品决定展示时：
TDAdInfo info = pending[0];
if (info != null && info.renderType == TDRenderType.SELF_RENDER) {
    TDNativeMaterial m = info.nativeMaterial;
    container.removeAllViews();
    LinearLayout root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    TextView title = new TextView(this);
    title.setText(m == null || m.title == null ? "" : m.title);
    title.setClickable(true);
    title.setTag(TDNativeMaterial.TAG_TITLE);
    TextView desc = new TextView(this);
    desc.setText(m == null || m.desc == null ? "" : m.desc);
    desc.setClickable(true);
    desc.setTag(TDNativeMaterial.TAG_DESC);
    TextView cta = new TextView(this);
    cta.setText(m == null || m.cta == null || m.cta.isEmpty() ? "查看详情" : m.cta);
    cta.setClickable(true);
    cta.setTag(TDNativeMaterial.TAG_CTA);
    root.addView(title);
    root.addView(desc);
    root.addView(cta);
    if (m != null && m.imageUrl != null && !m.imageUrl.isEmpty()) {
        ImageView img = new ImageView(this);
        img.setClickable(true);
        img.setTag(TDNativeMaterial.TAG_IMAGE);
        root.addView(img);
    }
    container.addView(root);
}
if (nativeAd.isReady()) {
    nativeAd.showAd(this, container, "your_scene");
}
```

**iOS**

```objc
self.nativeAd = [[TDNative alloc] initWithAdUnitId:YOUR_AD_UNIT_ID];
[self.nativeAd setAdListener:self];
[self.nativeAd setContainer:self.adContainer];
[self.nativeAd loadAd];

// 产品决定展示时：先按 lastInfo 拼装（仅 SELF_RENDER），再 Show
if ([self.nativeAd isReady]) {
    [self.nativeAd showAdFrom:self container:self.adContainer sceneId:@"your_scene"];
}
```

```objc
- (void)onAdLoaded:(TDAdInfo *)info {
    self.lastNativeInfo = info;
}
- (void)assembleIfNeeded:(TDAdInfo *)info {
    if (info.renderType != TDRenderTypeSelfRender) return;
    TDNativeMaterial *m = info.nativeMaterial;
    for (UIView *sub in [self.adContainer.subviews copy]) [sub removeFromSuperview];
    UILabel *title = [UILabel new];
    title.text = m.title ?: @"";
    title.userInteractionEnabled = YES;
    title.accessibilityIdentifier = TDNativeMaterial.tagTitle;
    UILabel *desc = [UILabel new];
    desc.text = m.desc ?: @"";
    desc.userInteractionEnabled = YES;
    desc.accessibilityIdentifier = TDNativeMaterial.tagDesc;
    UILabel *cta = [UILabel new];
    cta.text = m.cta.length ? m.cta : @"查看详情";
    cta.userInteractionEnabled = YES;
    cta.accessibilityIdentifier = TDNativeMaterial.tagCta;
    UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[title, desc, cta]];
    stack.axis = UILayoutConstraintAxisVertical;
    if (m.imageUrl.length) {
        UIImageView *img = [UIImageView new];
        img.userInteractionEnabled = YES;
        img.accessibilityIdentifier = TDNativeMaterial.tagImage;
        [stack addArrangedSubview:img];
    }
    stack.translatesAutoresizingMaskIntoConstraints = NO;
    [self.adContainer addSubview:stack];
}
- (void)onAdLoadFailed:(TDError *)error { }
- (void)onAdIsLoading { }
- (void)onAdImpression:(TDAdInfo *)info { }
- (void)onAdShowFailed:(TDError *)error { }
- (void)onAdClicked:(TDAdInfo *)info { }
- (void)onAdClosed:(TDAdInfo *)info {
    for (UIView *sub in [self.adContainer.subviews copy]) [sub removeFromSuperview];
}
- (void)onAdAllLoaded:(BOOL)ok { }
- (void)onBiddingStart:(TDAdInfo *)info { }
- (void)onBiddingEnd:(TDAdInfo *)info error:(TDError *)error { }
```

---

# 10 自定义参数与尺寸

> 文档版本：1.1.5

在 `loadAd` **之前**设置。尺寸会一直生效直到再改。底价只对下一次 `loadAd` 有效。

---

## 1. 默认尺寸

| 格式 | 不传尺寸时 |
| --- | --- |
| Banner | 屏宽 × 50dp（iOS 50pt） |
| 原生 | 屏宽 × 250dp（iOS 250pt） |
| 开屏 / 激励 / 插屏 | 整屏 |

容器仍须按各格式篇留够高度。

---

## 2. 指定尺寸

**Android**

```java
banner.setAdSize(1080, 150);

Map<String, Object> p = new HashMap<>();
p.put("width", 1080);
p.put("height", 150);
banner.setCustomParams(p);

TDAdsSDK.setAdSize(YOUR_AD_UNIT_ID, 1080, 150);
```

**iOS**

```objc
[banner setAdSize:320 height:50];
[banner setCustomParams:@{ @"width": @320, @"height": @50 }];
[TDAdsSDK setAdSize:YOUR_AD_UNIT_ID width:320 height:50];
```

宽高都大于 0 即可。字段名按顺序取：`adWidth`/`adHeight`，`width`/`height`，`w`/`h`。

---

## 3. 动态底价（分）

```java
reward.setBidFloor(1500);
// 或 customBidPrice
TDAdsSDK.setBidFloor(YOUR_AD_UNIT_ID, 1500);
```

```objc
[reward setBidFloor:1500];
[TDAdsSDK setBidFloor:YOUR_AD_UNIT_ID priceFen:1500];
```

`customBidPriceCurrency` 会被忽略。传 `0` 表示不设底价。用完需重新设置。低于底价的缓存和瀑布流层本轮不再用。

---

## 4. `userId` / `channel` 等

激励请传登录用户 ID。也可用 `setRewardVerify` / `setRewardVerifyUserId:customData:`。

常用字段：`userId`（或 `user_id` / `uid`）、`channel`、`appName`、`customData`。

```java
Map<String, Object> p = new HashMap<>();
p.put("userId", "your_app_user_id");
p.put("channel", "your_channel");
reward.setCustomParams(p);
```

```objc
[reward setCustomParams:@{
    @"userId": @"your_app_user_id",
    @"channel": @"your_channel"
}];
```

不要用 Demo 里的 `td_demo_user` 上线。

---

## 5. `sceneId`

展示时可选，用于区分场景。若对接平台要求数字，请传 `"1001"` 这种纯数字串。

---

# 11 回调与错误码

> 文档版本：1.1.5

---

## TDAdInfo

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `adUnitId` | long | 广告位 ID |
| `requestId` | String | 本次请求 ID |
| `networkName` | String | 广告平台名称 |
| `networkVersion` | String | 该平台 SDK 版本 |
| `layerId` | String | 广告源 ID |
| `ecpm` | double | 价格（分） |
| `fromBid` | boolean | 是否来自竞价 |
| `format` | Format | reward / interstitial / splash / banner / native |
| `renderType` | int | 仅原生：模板 `1` / 自渲染 `2` / 未知 `-1` |
| `nativeMaterial` | TDNativeMaterial | 仅自渲染有值 |

---

## TDError

| code | 含义 | 常见处理 |
| --- | --- | --- |
| 1001 | 参数错误 | App ID、Context、广告位 ID、已 destroy、容器；原生自渲染是否已拼装 |
| 1002 | 非主进程（仅 Android） | 在主进程 Init |
| 1003 | 无网络 | 恢复后重试 |
| 1004 | 超时 | 稍后 `loadAd` |
| 1005 | 无填充 | 检查广告源、投放地区、JinDai/AdGain 是否有 OAID/IDFA |
| 1006 | 配置错误 | 核对后台广告位与广告源 |
| 1007 | 广告平台模块缺失 | 未加对应 TD 模块，见 [02](#02-android-集成) / [03](#03-ios-集成) |
| 1008 | 广告平台异常 | 看 `msg`，升级对应 SDK |
| 1009 | 没有可展示的广告 / 开屏容器空 | 先 `isReady`；开屏传全屏容器 |
| 1014 | 没有可用广告源 | 后台尚未配置广告源 |
| 1015 | 初始化失败 | 检查网络与 App ID |
| 1016 | 该平台不支持此广告类型 | 换源或换类型 |
| 1018 | 正在加载 | 等待本轮结束 |
| 1019 | 未初始化 | 先完成 `initSdk` |
| 1020 | 三方 SDK 缺失 | 补上官方 SDK |
| 1021 | 依赖缺失 | Android `td-ads-base` / `td-ads-sdk`；iOS `TDAdsBase` / `TDAdsSDK` |
| 1022 | 广告源创建失败 | 核对后台配置与依赖 |

`TDError.toString()` 形如 `TDError{code=1005, msg=no fill, network=ltmb}`。

---

# 12 测试验收

> 文档版本：1.1.5

对接完成后按本页自测。官方 Demo 仅用于对照，**不要把 Demo 的广告位 ID 写进正式包**。

按本页必测项自测即可。

---

## 1. 必测项

| 项 | 通过标准 |
| --- | --- |
| Init | 主进程 / `didFinishLaunching` 调用一次；日志有初始化成功；空 AppId 收到 `onFailed`（1001），不闪退 |
| 激励 | Load 成功 → `isReady` → Show → 播完 `onAdReward` → 关闭 |
| 插屏 | 同上，无 Reward |
| 开屏 | 全屏容器；`onAdClosed` / `onAdShowFailed` 后进首页 |
| Banner | 顶/底展示完整；JinDai 容器 ≥200dp；关闭后从容器移除 |
| 原生模板 | `renderType=1`，不要自拼布局 |
| 原生自渲染 | `renderType=2`；Show **前**拼装并打 TAG；主图 TAG=`td_image`；iOS Label `userInteractionEnabled=YES` |
| Load ≠ Show | `onAdLoaded` 后容器仍空（或仅占位），点 Show 才出现广告 |
| 隐私默认 | **不调** `setPrivacyUserAgree` 也能出广告（默认开） |
| 关闭个性化 | `setPrivacyUserAgree(false)` 后不再出个性化广告 |
| OAID / IDFA | JinDai、AdGain 无设备标识时可能无填充；Android 等 OAID 回写后再 Load |
| 失败重试 | 失败后不立刻 `loadAd` |
| 当前广告 | Load 成功后 `getAdInfo()` 有值 |
| 释放 | 离开页面 `onDestroy`；destroy 后再 Load/Show 收到 1001 |

---

## 2. 联调环境

- 用你们后台自己的 App ID、广告位 ID。
- 真机优先。模拟器上 OAID / IDFA / 部分源可能无填充。
- 冷启动开屏：等 Init 成功再 Load。
- 看 Logcat / Xcode 控制台里 TD 与各源的失败原因。

---

## 3. 官方 Demo 对照（仅内部联调）

官方 Demo（对照用，正式包不要抄里面的广告位 ID）：

- Android：https://github.com/tydeonj/td-sdk-demo-android
- iOS：https://github.com/tydeonj/td-sdk-demo-ios

Demo 行为约定：

- 隐私开关默认开，与 SDK 默认一致。
- 原生自渲染在点 Show 时拼装，不在 `onAdLoaded` 里拼。

---

## 4. 常见验收失败对照

| 现象 | 先看 |
| --- | --- |
| 一直无填充 | [04](#04-初始化与隐私) 四门与 OAID/IDFA；[01](#01-后台配置) 广告源 |
| `1007` / adapter 缺失 | [02](#02-android-集成) / [03](#03-ios-集成) 是否加了对应模块 |
| 原生点了没反应、没图 | [09](#09-原生广告) TAG 与主图 |
| Load 后立刻看到文案 | 不要在 `onAdLoaded` 里拼装或 Show |
| 开屏进不了首页 | 必须在 Closed / ShowFailed 里收起 overlay |

---

# 13 FAQ

> 文档版本：1.1.5

---

## 初始化

**必须调 `setPrivacyUserAgree(true)` 才能出广告吗？**  
不必。默认就是开。只在用户明确拒绝时调 `false`。详见 [04](#04-初始化与隐私)。

**可以在子进程 Init 吗？**  
Android 不行，必须主进程。iOS 在 `didFinishLaunching`。

**Init 还没回调就 Load？**  
不要。尤其是冷启动开屏，等 Init 成功。

**App ID 写空会闪退吗？**  
不会。空 AppId / 空 Context 走 `onFailed`（1001）。

**对象已经 `onDestroy` 再 Load / Show？**  
会收到失败回调（1001），不会再哑巴返回。激励/插屏正在展示时再 Show，若上一页已销毁或超过 10 分钟，会先解开锁再试。`onDestroy` 不清广告池，要清缓存请再调 `clearCache()`。

**怎么拿到当前广告信息？**  
各格式都有 `getAdInfo()`，对应最近一次 Load 成功或即将 Show 的 `TDAdInfo`。原生自渲染也可在这里读 `renderType` / `nativeMaterial`。

---

## 填充与设备标识

**JinDai / AdGain 为什么没广告？**  
这两家依赖 OAID（Android）或 IDFA（iOS）。四门未开、OAID 还没回写、或用户拒绝 ATT，都可能无填充。见 [04](#04-初始化与隐私)。

**刚 Init 完就 Load，OAID 还是空的？**  
采集是异步的。等标识回写后再 Load，不要在 Init 当帧立刻请求。

**必须接 MSA / ATTracking？**  
要接 JinDai、AdGain 等依赖设备标识的源时，需要。其它源按该平台文档。

---

## 广告展示

**Load 成功了为什么 Show 说没缓存？**  
原生后台若配的是自渲染，客户端却当模板 Show（或反过来）会失败。以 `renderType` 为准。也可能上一轮已 Show 过，需重新 Load。

**原生 Load 完容器里已经有字？**  
那是宿主在 `onAdLoaded` 里拼装了。SDK 不会自动 Show。把拼装挪到点 Show 时。也可以用 `getAdInfo()` 取素材，或走模板 Show（Android `layoutRes` / iOS nib）。

**自渲染只有图标和字、点了没反应？**  
缺主图：没把 `imageUrl` 填进带 `td_image` 的 ImageView。  
点不动：Android 控件要 `clickable`；iOS `UILabel` 要 `userInteractionEnabled=YES`；并打上 TAG。

**JinDai Banner 被压扁？**  
官方高度自适应。容器不要锁 50dp，建议 ≥200dp。见 [08](#08-横幅广告banner)。

**开屏容器必须全屏吗？**  
是。过小会无法展示。Android 用 `INVISIBLE` 不要 `GONE`。

---

## 集成

**插屏报 adapter 缺失，激励却正常？**  
激励和插屏是不同模块。Android / iOS 都要单独加对应 TD 模块和三方 SDK。见 [02](#02-android-集成) / [03](#03-ios-集成)。

**AdGain 没有 Banner？**  
该平台无 Banner API，会 `formatUnsupported`。换源或不要给 Banner 位配 AdGain。

**iOS 能跑但编译仍有链接警告？**  
核对 ATS、`-ObjC`、LiteMob 版本与 rpath。见 [03](#03-ios-集成)。

---

## 回调与重试

**失败了立刻再 Load？**  
不要。必须重试时自己控制间隔。上一轮未结束会走 `onAdIsLoading`。

**`onAdReward` 和 `onAdClosed` 哪个先？**  
通常先 Reward 再 Close。以实际回调为准，发奖只写在 `onAdReward`。

**错误码在哪查？**  
[11 回调与错误码](#11-回调与错误码)。

---

# 隐私合规

> 文档版本：1.1.5

对标 T/TAF 188—2023。TD **不代弹**隐私窗，也不代弹 ATT。

---

## 1. 接入前必须做

1. App 提供独立《隐私政策》，首次启动弹窗取得用户同意（同意/拒绝都可选，禁止默认勾选）。
2. 在隐私政策中披露 TD SDK 及您实际接入的广告平台（见第 6 节模板）。
3. **用户同意后**再调用 `TDAdsSDK.initSdk`。同意前不要申请敏感权限、不要初始化 SDK。

```text
弹窗取得同意
  →（可选）deniedUploadDeviceInfo
  → setAuthUID / setOpenPersonalizedAd（按用户选择；AuthUID 建议 init 前）
  → initSdk
  → 请求广告
```

`setPrivacyUserAgree` **默认开，不必调用。** 仅用户拒绝时传 `false`。

采集 OAID（Android）/ IDFA（iOS）须同时：`setAuthUID(true)`、隐私总控未关、个性化未关、该字段未被禁报。`setAuthUID` **默认关**。iOS 还须 ATT 已授权。

---

## 2. 必要 / 可选信息

| 类别 | 字段（示例） | 用途 | 您怎么关 |
| --- | --- | --- | --- |
| 必要（一般） | OAID/IDFA（受开关）、型号、OS、分辨率、广告行为、IP/网络类型 | 归因、兼容、监测、反作弊 | OAID/IDFA 用 `setAuthUID`；字段禁报见下 |
| 可选 | 位置、安装列表、传感器、存储等 | 区域/已装 App 定向等 | `deniedUploadDeviceInfo` 或 `setPrivacyUserAgree(false)` |

不宜收集不可变设备标识。**IMEI / IMSI / MAC 默认不上报。** 用户拒绝可选信息时，与该信息无关的广告仍应能展示。

当前版本不提供热更新、自启动、关联启动。

---

## 3. 隐私 API

| API | 作用 | 时机 |
| --- | --- | --- |
| `setAuthUID` | 允许采 OAID / IDFA；**默认关**；持久化 | 建议 init 前 |
| `setOpenPersonalizedAd` | 个性化开关；**默认开**；不持久化，每次冷启动请按用户选择重设；关后不再采 OAID/IDFA | 可随时 |
| `setPrivacyUserAgree` | 隐私总控；**默认开，不必调用**；仅拒绝时传 `false` | 仅用户拒绝时 |
| `deniedUploadDeviceInfo` | 字段级禁报 | 建议 init 前 |
| `setPrivacyController` | 把定位、安装列表等能力透传给已接广告平台 | init 前 |

**Android**

```java
TDAdsSDK.deniedUploadDeviceInfo(
    TDPrivacyDeviceInfo.LOCATION,
    TDPrivacyDeviceInfo.APP_INSTALL_LIST
);
TDAdsSDK.setAuthUID(context, userAllowOaid);
TDAdsSDK.setOpenPersonalizedAd(userAllowPersonalized);
TDAdsSDK.initSdk(context, appId, new TDInitListener() { ... });
// 用户拒绝时才：TDAdsSDK.setPrivacyUserAgree(false);
```

**iOS**

```objc
[TDAdsSDK deniedUploadDeviceInfo:@[TDPrivacyKeyLocation, TDPrivacyKeyAppInstallList]];
[TDAdsSDK setAuthUID:userAllowIdfa];
[TDAdsSDK setOpenPersonalizedAd:userAllowPersonalized];
[TDAdsSDK initSdkWithAppId:appId listener:listener];
// 用户拒绝时才：[TDAdsSDK setPrivacyUserAgree:NO];
```

常用禁报字段：`LOCATION`、`OAID`、`IDFA`、`ANDROID_ID`、`IMEI`、`APP_INSTALL_LIST`、`SENSOR`。完整列表见 `TDPrivacyDeviceInfo`。

允许采标识时：优先用您传入的值，其次用 SDK 已缓存的值。都没有则不传空串。禁止采时才传空，避免广告平台再采。

**JinDai、AdGain 没有 OAID/IDFA 可能无填充。** LiteMob / Sigmob 有值才下传。

---

## 4. iOS ATT

`Info.plist` 配置 `NSUserTrackingUsageDescription`。**init 之前**由您调用 `ATTrackingManager requestTrackingAuthorization`。SDK 不代弹。

未授权、关掉 `setAuthUID`、关掉个性化或禁报 `IDFA` 时，不会上报有效 IDFA。

---

## 5. 权限

| 权限 | 必选 | 用途 |
| --- | --- | --- |
| 网络 | 是 | 广告请求 |
| 定位 | 否 | 仅未禁报且业务需要时由您申请 |
| 存储 | 否 | 下载类素材 |
| ATT（iOS） | 否 | IDFA，建议 init 前 |

用户拒权不阻断无关广告能力。

---

## 6. 隐私政策披露模板

| 项 | 内容 |
| --- | --- |
| SDK 名称 | TD 聚合 SDK（TD Ads SDK） |
| 主体 | （填写您的公司全称） |
| 使用目的 | 广告聚合变现、监测归因、反作弊、填充策略 |
| 处理个人信息 | 设备信息（OAID/IDFA 等可变标识、型号、OS、分辨率）、网络信息、广告行为；可选：位置、安装列表（受您的开关控制） |
| 收集方式 | SDK 自行采集 / 宿主透传 |
| 隐私政策链接 | （填写 TD SDK 隐私政策 URL） |
| 第三方 | 按实际接入披露 JinDai / AdGain / LiteMob 等，并附各方隐私链接 |

---

## 7. 用户撤回

| 用户要做的 | 您调用 |
| --- | --- |
| 撤回同意 | `setPrivacyUserAgree(false)`，并可停止请求广告 |
| 关闭个性化 | `setOpenPersonalizedAd(false)`，下次 load 生效 |
| 关闭标识采集 | `setAuthUID(false)` 或禁报 `OAID` / `IDFA` |

个性化开关 SDK **不落盘**，请您自己记住用户选择，每次启动重新设置。

---

# 国内隐私合规使用说明

# 国内隐私合规

宿主请看对接文档里的 [隐私合规](./TD_SDK_对接文档/隐私合规.md)。
