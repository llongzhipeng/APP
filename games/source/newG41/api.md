# 后端对接说明 — 太空探险家（tktxj）

## 概述

- **路径**：`POST /pbgamerecord/add`
- **gameType**：`tktxj`
- **trainType**：`implement`（注意能力训练）
- **游戏内时长单位**：**秒**（60 / 180 / 300）

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "implement",
  "gameType": "tktxj",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 2.35,
  "score": 120,
  "successCount": 8,
  "failCount": 2,
  "trainDuration": 180,
  "difficultyLevel": 3,
  "weight": 0.2
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| avgTime | number | 平均反应时间（**秒**，游戏内为毫秒，上传前转换） |
| trainDuration | number | 本局时长（秒，上传时归一化为分钟） |
| difficultyLevel | integer | 结束时 HUD 当前难度等级 |
