# 后端对接说明 — 拼图大师（ptds）

- **gameType**：`ptds` | **trainType**：`memory`
- **时长单位**：秒（60 / 180 / 300）

```json
{
  "archiveId": 123,
  "gameType": "ptds",
  "avgTime": 4.5,
  "score": 200,
  "successCount": 15,
  "failCount": 5,
  "trainDuration": 180,
  "difficultyLevel": 3
}
```

| 字段 | 说明 |
|------|------|
| avgTime | 平均反应时间（**秒**；游戏内已为秒） |
| difficultyLevel | 结束时 HUD `level`（非 maxLevel） |
