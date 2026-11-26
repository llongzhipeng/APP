# 儿童认知康复训练系统 · 管理端试玩接入

游戏资源来自平板 App v1.0.17，同一套游戏可在管理系统里试玩。管理系统继续使用现有医生或管理员登录，并由现有路由权限控制「全部训练任务」入口。点击卡片立即试玩，无需选择患者或输入平板训练码。游戏内展示结算，试玩组件只处理退出，不调用训练记录或今日计划接口。

## 部署

将本包中的 `public/training-preview/` 复制到管理前端的 `public/`，也可以在 Web 服务器上将该目录挂载到管理系统同域的 `/training-preview/`。应直接返回目录中的静态文件，优先于 SPA 的路由回退。脚本使用浏览器 ES Module，请用 HTTPS 部署，本机可用 localhost 预览。不要打开磁盘文件运行。试玩和管理页面须使用相同的协议、域名和端口。

## 接到现有卡片

在页面初始化时调用 `loadTrialCatalog()`。使用返回的 `categories` 和 `games` 给已有分类和卡片提供名称与封面。若页面已经维护卡片列表，用 `gameType` 从目录匹配即可。点击卡片调用 `openTrial`，不用改现有页面布局。

<script type="module"> 适用于 HTML 模板。组件项目可从相同地址动态导入，或把 `trial.js` 和 `trial.css` 一起交给现有项目构建并保留它们相对于目录文件的部署位置。

```html
<script type="module">
  import { loadTrialCatalog, openTrial } from '/training-preview/trial.js'

  const { games } = await loadTrialCatalog()
  const eyes = games.find(game => game.gameType === 'ysdx')
  document.querySelector('#preview-eyes').addEventListener('click', () => {
    openTrial(eyes, { difficulty: 1, seconds: 180, lang: 'zh' })
  })
</script>
```

示例中的 `#preview-eyes` 是现有「眼神读心」卡片的按钮。打开后，游戏内的返回、跳过或弹窗的「返回游戏列表」都可退出单局。卡片列表留在原页面。

## 后续更新

在 App 源码项目运行 `npm run build:h5`，再用 Node.js 22 或以上运行 `node export-assets.mjs /你的/uni-app项目路径` 刷新本包的游戏资源、封面和目录。部署时整体替换试玩的静态目录，避免资源版本混用。推荐从同一个 App 源码提交构建平板与管理端游戏。
