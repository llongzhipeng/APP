# 后端对接说明 — 视角转换（sjzh）

## 概述

- **gameType**：`sjzh`
- **trainType**：`space`（视空间能力）
- **时长单位**：分钟（游戏内 1 / 3 / 5）

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "space",
  "gameType": "sjzh",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 2.15,
  "score": 450,
  "successCount": 22,
  "failCount": 6,
  "trainDuration": 3,
  "difficultyLevel": 2
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒，`avgRt` 毫秒转换） |
| trainDuration | 分钟 |
| difficultyLevel | 结束时 `tracker.level`（HUD 当前难度） |
