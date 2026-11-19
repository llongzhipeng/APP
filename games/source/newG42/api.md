# 后端对接说明 — 人物档案（rwda）

## 概述

- **路径**：`POST /pbgamerecord/add`
- **gameType**：`rwda`
- **trainType**：`memory`（记忆能力训练）
- **游戏内时长单位**：**分钟**（App 存分钟；Game 内 `sessionLeft = duration * 60` 秒）

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "memory",
  "gameType": "rwda",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 3.2,
  "score": 95,
  "successCount": 6,
  "failCount": 1,
  "trainDuration": 3,
  "difficultyLevel": 2,
  "weight": 0.6
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| avgTime | number | 平均反应时间（**秒**） |
| trainDuration | number | 本局时长（**分钟**） |
| difficultyLevel | integer | 结束时 HUD 当前难度（罗马数字等级） |
