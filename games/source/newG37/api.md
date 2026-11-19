# 后端对接说明 — 分类挑战赛（fltzs）

## 概述

- **gameType**：`fltzs`
- **trainType**：`abstract`（抽象能力）
- **时长单位**：秒（DurationPage 选分钟 ×60 存入 App；批次 `setDuration` 直接设秒）

## 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "abstract",
  "gameType": "fltzs",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 2.1,
  "score": 95,
  "successCount": 15,
  "failCount": 4,
  "trainDuration": 180,
  "difficultyLevel": 3
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（秒） |
| trainDuration | 秒 |
| difficultyLevel | 结束时 `difficulty`（HUD 当前等级） |
