# 02 Android 集成

> 文档版本：1.1.6 · SDK `1.1.2.8`

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
| 当前 SDK | `1.1.2.8` |

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
def tdVer = '1.1.2.8'

implementation "com.tyedo:td-ads-base:${tdVer}"
implementation "com.tyedo:td-ads-sdk:${tdVer}"
```

---

## 4. 按需接入广告源

后台配了哪个平台，就加该平台的 **仓库 + TD 模块 + 官方 SDK**。三个都要有。

### JinDai

无需额外 Maven。把官方 `YDSDK-release.aar` 放到 `app/libs/`。

```groovy
implementation "com.tyedo:jdsdk_ads:${tdVer}"
implementation files('libs/YDSDK-release.aar')
```

### AdGain

仓库按 **AdGain 官方文档**配置（对方私有 Maven，账号向 AdGain 申请）。不要把账号密码写进工程或对外文档。

```groovy
implementation "com.tyedo:adgain_ads:${tdVer}"
implementation 'com.adgain:adgain-sdk:4.1.5'
```

**JinDai、AdGain 没有 OAID 不出广告。** `setAuthUID` 默认关，用户同意后、**init 前**打开，见 [04](./04_初始化与隐私.md)。LiteMob / Sigmob / Mintegral 不依赖这一条。

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

[04 初始化与隐私](./04_初始化与隐私.md)（在 `Application.onCreate`、**主进程**调用）。

