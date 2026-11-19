# 后端对接说明 — 守护花朵（shhd）

## 概述

- **gameType**：`shhd`
- **trainType**：`implement`
- **时长单位**：秒

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "implement",
  "gameType": "shhd",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 0.85,
  "score": 240,
  "successCount": 30,
  "failCount": 8,
  "trainDuration": 180,
  "difficultyLevel": 4
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒） |
| trainDuration | 秒 |
| difficultyLevel | 结束时 HUD `level` |
