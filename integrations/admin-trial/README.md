# 儿童认知康复训练系统 · 管理端试玩接入

本包复用平板 App v1.0.17 的 75 款游戏。把试玩站部署到独立的静态服务器，管理端通过 iframe 打开指定游戏。医生或管理员使用管理系统现有账号登录。试玩入口无需选择患者或输入平板训练码，结算由游戏展示，试玩站不调用训练记录或今日计划接口。

## 1. 部署独立的游戏服务器

将解压后的 `public/` 作为静态站点根目录。例如游戏域名为 `https://games.example.com`，管理端为 `https://admin.example.com`。

| 地址 | 用途 |
| --- | --- |
| `https://games.example.com/training-preview/play.html` | 在浏览器中打开全部游戏目录 |
| `https://games.example.com/training-preview/play.html?game=ysdx` | 直接打开「眼神读心」 |
| `https://games.example.com/training-preview/catalog.json` | 游戏码、名称、分类和封面地址 |

用 HTTPS 部署，并参考 `deploy/nginx.conf.example` 将管理端域名写进 `Content-Security-Policy` 的 `frame-ancestors`。配置需要覆盖试玩入口和嵌套的游戏 HTML，避免它们被服务器上的 `X-Frame-Options: SAMEORIGIN` 或更严格的同类规则挡住。管理端如已设置 CSP，需要在 `frame-src` 允许游戏服务器。部署到子目录时，调整管理端示例中的资源地址。

Nginx 示例只允许指定管理端域名跨域读取目录。若需从管理端动态读取目录，可 fetch 该地址，封面路径以目录的 URL 为基准解析。iframe 本身通过浏览器加载页面，跨域消息通过 postMessage 返回。

## 2. 管理端点击卡片打开 iframe

下面的容器可替换为管理端现有的弹窗。初始化时调用 `bindTrainingTrial`，点击卡片调用返回的 `open`，组件卸载时调用 `dispose`。管理端主动关闭弹窗时，调用 `close`，它会清理 iframe。

```html
<section id="trial-panel" hidden>
  <iframe title="训练游戏试玩" allow="autoplay; fullscreen"
          style="width:100%;height:90vh;border:0"></iframe>
</section>
```

```js
function bindTrainingTrial(panel) {
  const frame = panel.querySelector('iframe')
  const player = new URL('https://games.example.com/training-preview/play.html')
  let active

  function open(gameType, { difficulty = 1, seconds = 180, lang = 'zh' } = {}) {
    const channel = crypto.randomUUID()
    active = { gameType, channel }
    const url = new URL(player)
    url.search = new URLSearchParams({
      game: gameType, difficulty, seconds, lang, channel,
      parentOrigin: location.origin,
    })
    frame.src = url.href
    panel.hidden = false
  }

  function close() {
    active = undefined
    panel.hidden = true
    frame.removeAttribute('src')
  }

  function receive(event) {
    if (!active || event.origin !== player.origin || event.source !== frame.contentWindow) return
    const message = event.data
    if (message?.source !== 'drbrain-training-preview' || message.channel !== active.channel ||
        message.gameType !== active.gameType) return
    if (message.type === 'exit' || message.type === 'skip') close()
  }

  window.addEventListener('message', receive)
  return {
    open,
    close,
    dispose() {
      window.removeEventListener('message', receive)
      close()
    },
  }
}

const trial = bindTrainingTrial(document.querySelector('#trial-panel'))
// 在「眼神读心」卡片的点击事件中调用
// trial.open('ysdx', { difficulty: 2, seconds: 180, lang: 'zh' })
```

`game` 用目录中的 `gameType`，`difficulty` 为 1 至 6，`seconds` 单位为秒，`lang` 为 `zh` 或 `en`。独立浏览无需 `channel` 和 `parentOrigin`。管理端嵌入时建议两项都传，让游戏内的返回或跳过能关闭外层弹窗。URL 中只放试玩参数。

## 3. 用同一份游戏源码更新

在 App 源码项目运行 `npm run build:h5`，再用 Node.js 22 或以上运行 `node export-assets.mjs /你的/uni-app项目路径`。脚本从 App 构建产物复制游戏和封面，并从 `src/services/games.js` 生成目录。上传更新后的 `public/training-preview/` 即可。在管理端保留同一个试玩 URL。App 的游戏随 APK 发布。

同域接入方式仍可用。从 `trial.js` 导入 `loadTrialCatalog` 与 `openTrial`，用卡片对应的游戏对象调用 `openTrial(game)`。
