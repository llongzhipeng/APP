# 后端对接说明

## 概述

前端游戏（面孔记忆）在每局训练结束后，会自动向后端发送一条训练记录。

---

## 前端发送的请求

- **路径**：`/pbgamerecord/add`
- **方法**：`POST`
- **Content-Type**：`application/json`

### 请求体示例

```json
{
  "trainType": "memory",
  "gameType": "mjmy",
  "minTime": 0,
  "maxTime": 0,
  "avgTime": 0.78,
  "score": 420
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| trainType | string | 固定值 `"memory"` |
| gameType | string | 固定值 `"mjmy"`（面孔记忆缩写） |
| minTime | number | 本局最短反应时间（**秒**），当前固定为 0 |
| maxTime | number | 本局最长反应时间（**秒**），当前固定为 0 |
| avgTime | number | 本局平均反应时间（**秒**，保留 2 位小数） |
| score | integer | 本局得分 |

---

## 后端需要做的事

### 1. 配置 base URL / 反向代理

前端请求路径为 `/pbgamerecord/add`，通过 nginx 反向代理或 vite devServer proxy 转发：

```nginx
location /pbgamerecord/ {
    proxy_pass http://your-backend-server/pbgamerecord/;
}
```

### 2. 接口实现

从当前登录会话中获取 `archiveId`（患者用户ID，不由前端传递），与前端数据合并后写入数据库。

### 3. 响应格式

```json
{ "code": 200, "msg": "", "data": {} }
```

前端不依赖响应体内容，接口成功时返回 HTTP 200 即可。
