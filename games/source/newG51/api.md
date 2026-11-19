# 后端对接说明 — 规划达人

## 概述

前端游戏 `ghdr`（规划达人）在每局训练自然结束后，通过 `submitPbGameEndRecord` 上传训练记录。

---

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "attention",
  "gameType": "ghdr",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 12.5,
  "score": 420,
  "successCount": 15,
  "failCount": 3,
  "trainDuration": 3,
  "difficultyLevel": 4,
  "weight": 0.4
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| gameType | string | 固定 `"ghdr"` |
| trainType | string | 固定 `"attention"`（执行能力训练） |
| minTime / maxTime / avgTime | number | 反应时间，**秒** |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败题数 |
| trainDuration | number | 游戏内时长 **分钟**（1 / 3 / 5），上传时保持分钟 |
| difficultyLevel | integer | **结束时 HUD 当前难度**（非 maxDifficulty） |

---

## 备注

- 游戏内倒计时与时长选择均为 **分钟**制，已登记于 `MINUTE_UNIT_GAME_TYPES`。
- 平均反应时间游戏内为秒，经 `toPbGameSeconds` 上传。
