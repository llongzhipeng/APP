# 后端对接说明

## 概述

前端游戏（汉字训练营）在每局训练结束后，通过 `submitPbGameEndRecord` 向后端发送训练记录。

---

## 前端发送的请求

- **路径**：`/pbgamerecord/add`
- **方法**：`POST`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "trainType": "language",
  "gameType": "hzxly",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 2.35,
  "score": 420,
  "successCount": 18,
  "failCount": 4,
  "trainDuration": 180,
  "difficultyLevel": 3
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| trainType | string | 固定值 `"language"`（语言能力训练） |
| gameType | string | 固定值 `"hzxly"` |
| minTime / maxTime / avgTime | number | 反应时间（**秒**，保留 2 位小数） |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败次数 |
| trainDuration | number | 游戏内时长（**秒**） |
| difficultyLevel | integer | 结束时 HUD 当前难度等级 |

---

## 后端需要做的事

接口：`POST /pbgamerecord/add`，成功返回 HTTP 200 即可。
