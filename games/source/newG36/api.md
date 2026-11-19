# 后端对接说明 — 词语复述（cyfs）

## 概述

- **gameType**：`cyfs`
- **trainType**：`memory`（记忆能力）
- **时长单位**：分钟

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "memory",
  "gameType": "cyfs",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 4.5,
  "score": 120,
  "successCount": 8,
  "failCount": 2,
  "trainDuration": 5,
  "difficultyLevel": 2
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒；游戏内 `avgRT` 已为秒） |
| trainDuration | 分钟（`durationMin`） |
| difficultyLevel | 结束时 HUD `level` |
