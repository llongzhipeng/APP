# 医未 ADHD 每日训练客户端

面向 Android 平板的 uni-app + Vue 3 客户端，包含训练码/PIN 登录、每日任务、完成进度、按能力筛选的游戏目录和训练结果回传。「全部训练」用于自由练习，不计入今日任务。目录使用提供的封面和游戏预览图。

已接入原版游戏 1–25，以及新增的 newG01–newG15、newG17、newG19–newG52，共 75 项。「找不同」使用任务短码 `spotdiff`，归入视空间能力训练。「表情便利店」和「眼神读心」归入社会能力训练，任务短码分别为 `bqblbd` 和 `ysdx`。

「今日训练」中的「一键启动」按方案顺序进入第一项未完成任务。每项任务右侧显示完成状态，训练结果保存后刷新清单。

游戏页使用全屏布局。点屏幕右侧「⋯」打开返回、跳过和重听玩法。跳过今日任务会打开后续第一项可玩的未完成任务，跳过前没有完成的任务保留为未完成。自由练习会打开同类别的下一项游戏。

教程使用较大的说明文字和翻页按钮，按平板屏幕尺寸适配。内容超出屏幕时可以在教程卡片内上下滑动。

登录页的「中 / EN」和工作台的「训练语言」可设置游戏显示和播报语言。原游戏自带的中英文题目、数字和词语使用原录音。补充的普通话教程和难度提示以「眼神读心」的原录音为音色参考合成，英文使用独立的英语配音。两种语言的 75 款游戏均可离线播报。

## Android 平板安装

交付的 `yiwei-training-tablet.apk` 是预览签名包，适用于 Android 8.0 及以上。支持横屏和竖屏。安装后可使用演示账号立即体验。该预览包使用本地演示方案，连接真实后台需要设置服务地址并重新签名打包。

## 运行和打包

使用 Node.js 20 或以上版本，在项目根目录运行：

```bash
npm ci
npm run dev:h5
```

打开终端显示的地址，点击「填入演示账号」后选择「开始训练」。演示账号为 `DEMO-2026-001`，PIN 为 `123456`。演示模式将全部已接入游戏放在今日任务中，进度按设备本地日期保存。

| 命令 | 产物 |
| --- | --- |
| `npm run build:h5` | `dist/build/h5`，使用静态 HTTP 服务部署或预览 |
| `npm run build:app` | `dist/build/app`，包含离线游戏 HTML、脚本和图片资源 |

生成 Android APK 需要 JDK 17 或以上、Android SDK Platform 35、Build-Tools 35.0.1，以及 Bash 和 Zip。设置 `ANDROID_SDK_ROOT` 后，在项目根目录运行 `bash android/build-apk.sh`。输出为 `dist/android/yiwei-training-tablet.apk`。脚本将 uni-app 的 H5 产物作为离线资源放进 Android WebView，不需要 DCloud 云打包。配置真实后台时，H5 API 的跨域来源为 `https://appassets.androidplatform.net`。

默认脚本使用本地生成的预览密钥。正式打包可指定 `ANDROID_KEYSTORE`、`ANDROID_KEY_ALIAS`，并通过交互或 `ANDROID_KEYSTORE_PASSWORD` 提供签名口令。如使用另一签名来替换已安装的预览包，需要先卸载预览包。若选择 `build:app` 生成的 App-Plus 资源，则按 HBuilderX 流程配置 DCloud AppID 和签名。

## 对接后台

将 `.env.example` 复制为 `.env.local`，把 `VITE_API_BASE_URL` 设置为 HTTPS API 根地址，再编译。配置地址后，登录、计划及结果全部走后台接口。登录后 API 请求携带 `Authorization: Bearer <token>`。H5 跨域部署时需要允许对应来源、方法和请求头。

接口集中在 `src/services/training.js`。URL 和字段可按现有后台调整。以下为当前工程的直接 JSON 约定。

| 方法与路径 | 请求和响应 |
| --- | --- |
| `POST /api/v1/auth/training-login` | 发送 `{ trainingCode, pin }`，返回 `{ token, patient: { id, name, mrn } }` |
| `GET /api/v1/training/plans/today` | 返回 `{ id, date, tasks }`，日期格式为 `YYYY-MM-DD`，无任务时返回 `tasks: []` |
| `PUT /api/v1/training/plans/{planId}/tasks/{taskId}/result` | 接收 `{ gameType, trainType, score, durationSeconds, difficultyLevel, successCount, failCount, minTime, maxTime, avgTime }`，返回 200 或 204。同一方案和任务的重试应按同一资源处理 |

任务示例：

```json
{
  "id": "task-001",
  "gameKey": "jyjz",
  "title": "记忆矩阵",
  "category": "记忆力",
  "difficulty": 2,
  "estimatedMinutes": 3,
  "durationSeconds": 180,
  "completed": false
}
```

`gameKey` 使用原游戏短码，映射见 `src/services/games.js`，比如 `jyjz` 为记忆矩阵，`szqb` 为数字快捕。也支持原目录名，如 `game6`。可选字段 `durationSeconds` 优先于 `estimatedMinutes`。后者用于清单的预计时长。客户端按方案提供开始难度和训练时长，游戏内的动态难度机制沿用原逻辑。客户端在进入今日训练、从游戏返回、手动刷新或下拉时请求方案。后端接到结果后应在新的方案响应中把对应任务的 `completed` 设为 `true`。

## 游戏来源和适配

原游戏源码在 `games/source/`。其构建和旧系统模块的兼容层在 `games/build.mjs` 和 `games/bridge/`。H5 通过 iframe 加载同源游戏页面，App-Plus 通过本地 WebView 加载。App WebView SDK 为 DCloud 上游的 `uni.webview.1.5.8.js`。训练结果统一由客户端提交，通过游戏页的任务上下文关联登录账号和训练方案。
