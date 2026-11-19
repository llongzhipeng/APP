# 后端对接说明 — 词义分类（cyfl）

## 概述

- **gameType**：`cyfl`
- **trainType**：`language`
- **时长单位**：分钟（方案批次传入分钟；游戏内倒计时为秒）

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "language",
  "gameType": "cyfl",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 1.92,
  "score": 380,
  "successCount": 25,
  "failCount": 5,
  "trainDuration": 3,
  "difficultyLevel": 3
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒） |
| trainDuration | 分钟 |
| difficultyLevel | 结束时 `finalLevel` |
