# Cloud Functions 部署说明

## 1. 配置 Gemini API Key（必须先完成）

**生产环境（必须）**：使用 Secret Manager 配置：
```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"
firebase functions:secrets:set GEMINI_API_KEY
# 按提示输入你的 Gemini API Key（如 AIzaSy...）
```

**本地开发（Emulator）**：在 `functions/` 目录下创建 `.env` 文件：
```
GEMINI_API_KEY=你的_API_Key
```

注意：部署到云端的 Function 不会读取 .env，必须通过 Secret Manager 配置。

## 2. 部署

```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## 3. 函数说明

- **extractListing**（Callable）：供 Admin 前端调用，用于从 fact sheet 图片或文字中提取房源信息
- 仅允许 `oscar@oscaryan.my` 邮箱调用
- 区域：asia-southeast1
