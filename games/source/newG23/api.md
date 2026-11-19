# 后端对接说明

## 概述

前端游戏（视听冲突）在每局训练结束后，会自动向后端发送一条训练记录。

---

## 前端发送的请求

- **路径**：`/pbgamerecord/add`
- **方法**：`POST`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "trainType": "implement",
  "gameType": "stct",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 0.78,
  "score": 420,
  "successCount": 10,
  "failCount": 2,
  "trainDuration": 180,
  "difficultyLevel": 4
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| trainType | string | 固定值 `"implement"`（注意能力） |
| gameType | string | 固定值 `"stct"`（视听冲突缩写） |
| minTime / maxTime / avgTime | number | 反应时间（秒） |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败次数 |
| trainDuration | number | 游戏内时长（秒，上传时归一化为分钟） |
| difficultyLevel | integer | 结束时难度等级 |

---

## 后端需要做的事

接口：`POST /pbgamerecord/add`，成功返回 HTTP 200 即可。
