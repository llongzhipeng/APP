# 后端对接说明 — 时钟设置师（szszs）

- **gameType**：`szszs` | **trainType**：`attention`（执行能力训练）
- **时长单位**：秒（60 / 180 / 300）

```json
{
  "archiveId": 123,
  "gameType": "szszs",
  "avgTime": 8.2,
  "score": 150,
  "successCount": 10,
  "failCount": 3,
  "trainDuration": 180,
  "difficultyLevel": 4
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（**秒**，由毫秒转换） |
| difficultyLevel | 结束时 HUD 当前难度 |
