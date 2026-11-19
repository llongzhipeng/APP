# 后端对接说明 — 火眼金睛（hyjj）

- **gameType**：`hyjj` | **trainType**：`space`
- **时长单位**：秒（60 / 180 / 300）

```json
{
  "archiveId": 123,
  "gameType": "hyjj",
  "avgTime": 2.1,
  "score": 320,
  "successCount": 18,
  "failCount": 6,
  "trainDuration": 180,
  "difficultyLevel": 2
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（**秒**，由毫秒转换） |
| difficultyLevel | 结束时 HUD 当前难度 |
