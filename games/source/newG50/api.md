# 后端对接说明 — 成语填空

## 概述

前端游戏 `cytk`（成语填空）在每局训练自然结束后，通过 `submitPbGameEndRecord` 上传训练记录。

---

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "language",
  "gameType": "cytk",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 3.8,
  "score": 150,
  "successCount": 12,
  "failCount": 5,
  "trainDuration": 180,
  "difficultyLevel": 3,
  "weight": 0.4
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| gameType | string | 固定 `"cytk"` |
| trainType | string | 固定 `"language"`（语言能力训练） |
| minTime / maxTime / avgTime | number | 反应时间，**秒** |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败题数 |
| trainDuration | number | 游戏内时长 **秒** |
| difficultyLevel | integer | **结束时 HUD 当前难度**（非 maxLevel） |

---

## 备注

- 游戏内训练时长单位为 **秒**。
- 难度采用 pending 下一题生效机制，上传取 HUD 上的 `level` 而非 `maxLevel`。
