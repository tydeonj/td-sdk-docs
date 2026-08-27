# 03 iOS 集成

> 文档版本：1.1.6 · SDK `1.1.2.6`

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
| 当前 SDK | `1.1.2.6` |

---

## 2. TD 核心（必加）

工程根目录 `Podfile`：

```ruby
platform :ios, '12.0'
use_frameworks! :linkage => :static

target 'YourApp' do
  pod 'TDAdsBase', '1.1.2.6'
  pod 'TDAdsSDK',  '1.1.2.6'
end
```

`pod install` 后用 `.xcworkspace` 打开。

---

## 3. 按需接入广告源

### JinDai

```ruby
pod 'TDAdsJDSDK', '1.1.2.6'
pod 'JinDaiSDK', :subspecs => ['JinDaiSDK']
```

下游 subspec 按 JinDai 官方文档按需补。

### AdGain

```ruby
pod 'TDAdsAdGain', '1.1.2.6'
pod 'AdGainSDK', '4.2.8.2'
```

Trunk 若尚未收录该版本，按 AdGain 官方仓库把 SDK 放到本地后 `:path` 引入（不要把账号写进文档）。Android 对方 SDK 版本跟 AdGain Android 官方，与 iOS 版本号可以不同。

**JinDai、AdGain 没有 IDFA 不出广告。** 须 ATT 授权；`setAuthUID` 默认关，用户同意后、**init 前**打开，见 [04](./04_初始化与隐私.md)。

### LiteMob

```ruby
pod 'TDAdsLtmb', '1.1.2.6'
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

[04 初始化与隐私](./04_初始化与隐私.md)（在 `application:didFinishLaunchingWithOptions:` 中、用户同意后再 Init）。

