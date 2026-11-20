# 医未 ADHD 每日训练客户端

面向 Android 平板的 uni-app + Vue 3 客户端，包含训练码/PIN 登录、每日任务、完成进度、按能力筛选的游戏目录和训练结果回传。「全部训练」用于自由练习，不计入今日任务。目录使用提供的封面和游戏预览图。

已接入原版游戏 1–25，以及新增的 newG01–newG15、newG17、newG19–newG52，共 75 项。「找不同」使用任务短码 `spotdiff`，归入视空间能力训练。「表情便利店」和「眼神读心」归入社会能力训练，任务短码分别为 `bqblbd` 和 `ysdx`。

「今日训练」中的「一键启动」按方案顺序进入第一项未完成任务。每项任务右侧显示完成状态，训练结果保存后刷新清单。

游戏页使用全屏布局。点屏幕右侧「⋯」打开返回、跳过和重听玩法。跳过今日任务会打开后续第一项可玩的未完成任务，跳过前没有完成的任务保留为未完成。自由练习会打开同类别的下一项游戏。

教程使用较大的说明文字和翻页按钮，按平板屏幕尺寸适配。内容超出屏幕时可以在教程卡片内上下滑动。

登录页的「中 / EN」和工作台的「训练语言」可设置游戏显示和播报语言。原游戏自带的中英文题目、数字和词语使用原录音。补充的普通话教程和难度提示以「眼神读心」的原录音为音色参考合成，英文使用独立的英语配音。两种语言的 75 款游戏均可离线播报。

## Android 平板安装

交付的 `yiwei-training-tablet.apk` 是预览签名包，适用于 Android 8.0 及以上。支持横屏和竖屏。安装后使用医生提供的训练码与 PIN 登录开发服。登录、读取今日计划和保存记录需要网络。

## 运行和打包

使用 Node.js 20 或以上版本，在项目根目录运行：

```bash
npm ci
npm run dev:h5
```

打开终端显示的地址，使用训练码与 PIN 登录。需要本地演示时，在编译前于 .env.local 设置 `VITE_TRAINING_DEMO=true`，然后点击「填入演示账号」。演示账号为 `DEMO-2026-001`，PIN 为 `123456`。演示模式将全部已接入游戏放在今日任务中，进度按设备本地日期保存。

| 命令 | 产物 |
| --- | --- |
| `npm run build:h5` | `dist/build/h5`，使用静态 HTTP 服务部署或预览 |
| `npm run build:app` | `dist/build/app`，包含离线游戏 HTML、脚本和图片资源 |

生成 Android APK 需要 JDK 17 或以上、Android SDK Platform 35、Build-Tools 35.0.1，以及 Bash 和 Zip。设置 `ANDROID_SDK_ROOT` 后，在项目根目录运行 `bash android/build-apk.sh`。输出为 `dist/android/yiwei-training-tablet.apk`。脚本将 uni-app 的 H5 产物作为离线资源放进 Android WebView，不需要 DCloud 云打包。配置真实后台时，H5 API 的跨域来源为 `https://appassets.androidplatform.net`。

默认脚本使用本地生成的预览密钥。正式打包可指定 `ANDROID_KEYSTORE`、`ANDROID_KEY_ALIAS`，并通过交互或 `ANDROID_KEYSTORE_PASSWORD` 提供签名口令。如使用另一签名来替换已安装的预览包，需要先卸载预览包。若选择 `build:app` 生成的 App-Plus 资源，则按 HBuilderX 流程配置 DCloud AppID 和签名。

## 对接后台

默认地址为 `https://attentiondev.drbrain.net/drain-doctor-service`。可通过 `.env.local` 的 `VITE_API_BASE_URL` 切换服务，修改后需重新构建。接口位于 `src/services/training.js`。登录后的请求携带 `Authorization: Bearer <token>`。

| 方法与路径 | 请求 | 处理 |
| --- | --- | --- |
| `POST /login/pin` | JSON 字符串字段 `code`、`pin`，保留前导零 | HTTP 成功且响应体 `code` 为 200 后读取 `data.token` 和档案号（`archive` 或 `archiveId`） |
| `GET /pbgamerecord/plan/today` | 查询参数 `archiveId`，由服务端确定今天的日期 | 按 `data` 数组的顺序展示任务。游戏用 `gameType` 匹配，起始难度取 `level`。状态取 `status`，0 为未完成，1 为已完成 |
| `POST /pbgamerecord/add` | JSON 包含 `archiveId`、`trainType`、`gameType`、`minTime`、`maxTime`、`avgTime`、`score`、`difficultyLevel`、`successCount`、`failCount`、`trainDuration` | 响应体 `code` 为 200 后提示已保存，返回清单时重新获取后台状态 |

计划时长 `duration`、已训练时长 `completeDuration` 和上报时长 `trainDuration` 均以分钟计。游戏内部沿用各自的计时方式，提交时将游戏桥接层给出的秒数换算为接口要求的整数分钟。已完成任务显示后台的 `updateTime`，界面标为“状态更新于”。服务端未提供单独的完成时间戳。接口约定见 [ShowDoc](https://www.showdoc.com.cn/p/2678bc99f0568a0fd0d25dcafd65e10d)。

## 游戏来源和适配

原游戏源码在 `games/source/`。其构建和旧系统模块的兼容层在 `games/build.mjs` 和 `games/bridge/`。H5 通过 iframe 加载同源游戏页面，App-Plus 通过本地 WebView 加载。App WebView SDK 为 DCloud 上游的 `uni.webview.1.5.8.js`。训练结果统一由客户端提交，通过游戏页的任务上下文关联登录账号和训练方案。
