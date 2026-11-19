# 后端对接说明 — 看图猜成语（ktccy）

## 概述

- **gameType**：`ktccy`
- **trainType**：`language`（语言能力）
- **时长单位**：秒

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "language",
  "gameType": "ktccy",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 3.8,
  "score": 28,
  "successCount": 12,
  "failCount": 3,
  "trainDuration": 180,
  "difficultyLevel": 4
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒） |
| difficultyLevel | 结束时 `level`（HUD 展示等级） |
