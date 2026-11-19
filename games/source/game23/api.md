# 后端对接说明 — 钥匙匹配（yspp）

## 概述

前端游戏（钥匙匹配）在每局训练结束后，通过公共壳层 `submitPbGameEndRecord` 向后端发送一条训练记录。

---

## 前端发送的请求

- **路径**：`/pbgamerecord/add`
- **方法**：`POST`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "trainType": "memory",
  "gameType": "yspp",
  "minTime": 0.32,
  "maxTime": 1.85,
  "avgTime": 0.78,
  "score": 420,
  "successCount": 18,
  "failCount": 4,
  "trainDuration": 3,
  "difficultyLevel": 3,
  "weight": 2
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| trainType | string | Tab 写入，记忆能力为 `"memory"` |
| gameType | string | 固定值 `"yspp"`（钥匙匹配） |
| minTime / maxTime / avgTime | number | 反应时间（**秒**） |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败次数 |
| trainDuration | number | 上传时归一化为**分钟** |
| difficultyLevel | integer | 结束时 HUD 当前难度 |
| weight | number | 由 `difficultyStars` 映射，壳层自动补齐 |

---

## 后端需要做的事

接口：`POST /pbgamerecord/add`，成功返回 HTTP 200 即可。`archiveId` 由登录会话获取。
