# 后端对接说明 — 烟花计数器（yhjsq）

## 概述

- **gameType**：`yhjsq`
- **trainType**：`implement`
- **时长单位**：分钟

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "implement",
  "gameType": "yhjsq",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 3.42,
  "score": 87.5,
  "successCount": 14,
  "failCount": 3,
  "trainDuration": 3,
  "difficultyLevel": 2
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒） |
| trainDuration | 分钟（`selectedDuration`） |
| difficultyLevel | 结束时 `game.difficulty` |
