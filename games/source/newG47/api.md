# 后端对接说明 — 记忆藏宝图（位置）

## 概述

前端游戏 `jyzbtwz`（记忆藏宝图·位置）在每局训练自然结束后，通过 `submitPbGameEndRecord` 上传训练记录。

---

## 请求

- **路径**：`POST /pbgamerecord/add`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "archiveId": 123,
  "trainType": "memory",
  "gameType": "jyzbtwz",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 2.35,
  "score": 420,
  "successCount": 18,
  "failCount": 4,
  "trainDuration": 180,
  "difficultyLevel": 3,
  "weight": 0.4
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| gameType | string | 固定 `"jyzbtwz"` |
| trainType | string | 固定 `"memory"`（记忆能力训练） |
| minTime / maxTime / avgTime | number | 反应时间，**秒**（保留 2 位小数） |
| score | integer | 本局得分 |
| successCount / failCount | integer | 成功/失败题数 |
| trainDuration | number | 游戏内时长 **秒**（上传时归一化为分钟） |
| difficultyLevel | integer | **结束时 HUD 展示的难度**，非历史峰值 |

---

## 备注

- 游戏内训练时长单位为 **秒**（60 / 180 / 300）。
- 批次模式（`batch=1`）提交成功后由壳层自动跳转下一款游戏。
