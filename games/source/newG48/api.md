# 后端对接说明 — 情绪收集之旅

## 概述

前端游戏 `qxsjzl`（情绪收集之旅）在每局训练自然结束后，通过 `submitPbGameEndRecord` 上传训练记录。

---

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "society",
  "gameType": "qxsjzl",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 0.85,
  "score": 360,
  "successCount": 42,
  "failCount": 8,
  "trainDuration": 180,
  "difficultyLevel": 2,
  "weight": 0.2
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| gameType | string | 固定 `"qxsjzl"` |
| trainType | string | 固定 `"society"`（社会能力训练） |
| minTime / maxTime / avgTime | number | 反应时间，**秒** |
| score | integer | 本局得分 |
| successCount / failCount | integer | 接住/漏接次数 |
| trainDuration | number | 游戏内时长 **秒** |
| difficultyLevel | integer | **结束时 HUD 当前难度等级** |

---

## 备注

- 游戏内训练时长单位为 **秒**。
- 平均反应时间为毫秒级采集后转换为秒上传。
