# 后端对接说明 — 安全厨房（问答）

## 概述

前端游戏 `aqcfwd`（安全厨房·问答）在每局训练倒计时结束后，通过 `submitPbGameEndRecord` 上传训练记录。

---

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "attention",
  "gameType": "aqcfwd",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 4.12,
  "score": 280,
  "successCount": 22,
  "failCount": 6,
  "trainDuration": 300,
  "difficultyLevel": 4,
  "weight": 0.6
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| gameType | string | 固定 `"aqcfwd"`（原 `aqcf` 已废弃） |
| trainType | string | 固定 `"attention"`（执行能力训练 Tab） |
| minTime / maxTime / avgTime | number | 反应时间，**秒** |
| score | integer | 本局得分 |
| successCount / failCount | integer | 答对/答错题数 |
| trainDuration | number | 游戏内时长 **秒** |
| difficultyLevel | integer | **结束时 HUD 当前 Lv** |

---

## 备注

- 游戏内训练时长单位为 **秒**（180 / 300 / 600 等选项）。
- 平均反应时间游戏内已为秒，直接经 `toPbGameSeconds` 上传。
