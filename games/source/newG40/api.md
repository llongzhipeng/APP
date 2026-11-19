# 后端对接说明 — 空间镜像（kjjx）

## 概述

前端游戏在每局训练结束后，通过 `submitPbGameEndRecord` 向后端发送训练记录。

- **路径**：`POST /pbgamerecord/add`
- **gameType**：`kjjx`
- **trainType**：`space`（视空间能力训练）
- **游戏内时长单位**：**分钟**（1 / 3 / 5）

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "space",
  "gameType": "kjjx",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 1.25,
  "score": 85,
  "successCount": 12,
  "failCount": 3,
  "trainDuration": 3,
  "difficultyLevel": 2,
  "weight": 0.2
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| avgTime | number | 平均反应时间（**秒**，由毫秒转换） |
| trainDuration | number | 本局时长（**分钟**） |
| difficultyLevel | integer | 结束时 HUD 当前难度（非 maxDifficulty） |
| successCount / failCount | integer | 答对 / 答错（含超时、跳过题目） |
