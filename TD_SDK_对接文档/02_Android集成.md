# 02 Android 集成

> 文档版本：1.1.6 · SDK `1.1.2.8`

推荐把 **TD 核心和全部广告源** 都加上（每个源都是 **TD 模块 + 官方 SDK**）。只加了 TD 模块、没加官方 SDK，加载会失败（错误码 `1020`）。

对照工程：https://github.com/tydeonj/td-sdk-demo-android

---

## 1. 环境

| 项 | 说明 |
| --- | --- |
| AndroidX | 必须 |
| minSdk | 16 |
| Java | 8 及以上 |
| 初始化进程 | **仅主进程**（否则 `1002`） |
| 当前 SDK | `1.1.2.8` |

---

## 2. Maven 仓库（TD 必加）

TD 在 Maven Central。项目级 `build.gradle`（或 `settings.gradle` 的 `dependencyResolutionManagement`）：

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://hub.litemob.com/api/v4/projects/2/packages/maven' }
        // AdGain 私有仓按 AdGain 官方文档配置，不要把账号写进工程
    }
}
```

---

## 3. 推荐依赖（核心 + 全部源）

复制到 **app 模块** `dependencies`：

```groovy
def tdVer = '1.1.2.8'

implementation "com.tyedo:td-ads-base:${tdVer}"
implementation "com.tyedo:td-ads-sdk:${tdVer}"

// JinDai：官方 YDSDK-release.aar 放到 app/libs/
implementation "com.tyedo:jdsdk_ads:${tdVer}"
implementation files('libs/YDSDK-release.aar')

// AdGain：对方仓库按 AdGain 官方文档配置，不要把账号写进工程
implementation "com.tyedo:adgain_ads:${tdVer}"
implementation 'com.adgain:adgain-sdk:4.1.5'

// LiteMob
implementation "com.tyedo:ltmb_ads:${tdVer}"
implementation 'com.ltmb.ltsdk:core:2.9.5'
implementation 'com.github.bumptech.glide:glide:4.13.0'
implementation 'com.google.code.gson:gson:2.8.6'
implementation 'com.squareup.okhttp3:okhttp:4.12.0'
implementation 'androidx.cardview:cardview:1.0.0'
```

工程里已有 Glide / Gson / OkHttp / CardView 可不再重复加。

---

## 4. 各源说明

每个源都要有 **仓库（如需）+ TD 模块 + 官方 SDK**。推荐全部添加。

### JinDai

无需额外 Maven。把官方 `YDSDK-release.aar` 放到 `app/libs/`。

### AdGain

仓库按 **AdGain 官方文档**配置（对方私有 Maven，账号向 AdGain 申请）。不要把账号密码写进工程或对外文档。

**JinDai、AdGain 没有 OAID 不出广告。** `setAuthUID` 默认关，用户同意后、**init 前**打开，见 [04](./04_初始化与隐私.md)。LiteMob / Sigmob / Mintegral 不依赖这一条。

### LiteMob

LiteMob 仓库已写在第 2 节。工程里已有 Glide / Gson / OkHttp / CardView 可不再重复加。

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

**推荐与依赖一并全部加上**

```text
-keep public class com.td.ads.jdsdk.** { *; }
-keep public class com.td.ads.adgain.** { *; }
-keep public class com.td.ads.ltmb.** { *; }
```

各广告平台官方 SDK 的混淆规则，按该平台文档自行添加。

---

## 7. 下一步

[04 初始化与隐私](./04_初始化与隐私.md)（在 `Application.onCreate`、**主进程**调用）。

