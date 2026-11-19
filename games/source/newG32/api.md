# 后端对接说明 — 课堂学习（ktxx）

## 概述

前端游戏在每局训练结束后，通过 `submitPbGameEndRecord` 发送训练记录。

- **gameType**：`ktxx`
- **trainType**：`implement`（注意能力）
- **时长单位**：秒（游戏内 60 / 180 / 300）

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "implement",
  "gameType": "ktxx",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 1.25,
  "score": 320,
  "successCount": 18,
  "failCount": 4,
  "trainDuration": 180,
  "difficultyLevel": 3
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| avgTime | number | 平均反应时间（**秒**，由 ms 转换） |
| trainDuration | number | 游戏内时长（秒；上传时归一化为分钟） |
| difficultyLevel | integer | **结束时 HUD 当前难度**，非峰值 |
