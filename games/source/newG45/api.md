# 后端对接说明 — 折痕侦探（zhzt）

- **gameType**：`zhzt` | **trainType**：`space`
- **时长单位**：秒（60 / 180 / 300）

```json
{
  "archiveId": 123,
  "gameType": "zhzt",
  "avgTime": 6.8,
  "score": 180,
  "successCount": 12,
  "failCount": 4,
  "trainDuration": 180,
  "difficultyLevel": 3
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（**秒**，由毫秒转换） |
| difficultyLevel | 结束时 HUD 当前难度 |
