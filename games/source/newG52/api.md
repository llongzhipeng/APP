# 后端对接说明 — 眼神读心

## 概述

前端游戏 `ysdx`（眼神读心）在每局训练倒计时结束后，通过 `submitPbGameEndRecord` 上传训练记录。

---

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "society",
  "gameType": "ysdx",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 2.15,
  "score": 420,
  "successCount": 28,
  "failCount": 7,
  "trainDuration": 180,
  "difficultyLevel": 3,
  "weight": 0.4
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| gameType | string | 固定 `"ysdx"` |
| trainType | string | 固定 `"society"`（社会能力训练） |
| minTime / maxTime / avgTime | number | 反应时间，**秒** |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败题数 |
| trainDuration | number | 游戏内时长 **秒** |
| difficultyLevel | integer | **结束时 HUD 当前难度等级** |

---

## 备注

- 游戏内训练时长单位为 **秒**（60 / 180 / 300）。
- 中途确认退出调用 `leavePbGameWindow`，不上传记录。
