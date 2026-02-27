# 修复 Gemini API Key 配置问题

## 问题诊断

根据错误信息 `us-central1-oscar-pr...et/extractListing:1` 返回 500 错误，问题很可能是 Firebase Functions 中的 `GEMINI_API_KEY` Secret 没有正确配置。

## 解决步骤

### 步骤 1: 确认 API Key 值

从 `functions/.env` 文件中确认你的 Gemini API Key：
```bash
cat functions/.env
```

应该看到类似：
```
GEMINI_API_KEY=AIzaSyADWo32hBMatp4px715sqKHPUxjF1srJXQ
```

### 步骤 2: 设置 Firebase Secret（生产环境）

在项目根目录执行：

```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"

# 设置 Secret（会提示输入 API Key）
firebase functions:secrets:set GEMINI_API_KEY

# 按提示输入你的 Gemini API Key（如 AIzaSyADWo32hBMatp4px715sqKHPUxjF1srJXQ）
```

**重要**：如果之前已经设置过，这个命令会更新 Secret。

### 步骤 3: 验证 Secret 是否设置成功

```bash
# 查看已设置的 Secrets
firebase functions:secrets:access GEMINI_API_KEY

# 或者列出所有 Secrets
firebase functions:secrets:list
```

### 步骤 4: 重新部署 Functions

设置 Secret 后，**必须重新部署 Functions** 才能生效：

```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 步骤 5: 验证部署

部署完成后，检查日志：

```bash
# 查看最近的函数日志
firebase functions:log --only extractListing --limit 10
```

如果看到 "GEMINI_API_KEY not configured" 错误，说明 Secret 没有正确设置。

## 替代方案：使用 String Parameter（如果 Secret 有问题）

如果 Secret 方式有问题，可以改用 String Parameter：

### 修改代码（临时方案）

编辑 `functions/src/index.ts`，将第 11-12 行改为：

```typescript
// 注释掉 Secret，改用 String Parameter
// const geminiApiKeySecret = defineSecret('GEMINI_API_KEY');
const geminiApiKeyParam = defineString('GEMINI_API_KEY', {
  default: process.env.GEMINI_API_KEY || '',
});
```

然后修改第 43-46 行：

```typescript
export const extractListing = onCall(
  {
    region: 'us-central1',
    // secrets: [geminiApiKeySecret],  // 注释掉
  },
  async (request) => {
    // ...
    const apiKey = geminiApiKeyParam.value() || process.env.GEMINI_API_KEY;
    // ...
  }
);
```

然后设置 String Parameter：

```bash
firebase functions:config:set gemini.api_key="你的_API_Key"
firebase deploy --only functions
```

**注意**：String Parameter 的值会以明文形式存储在配置中，安全性不如 Secret。

## 推荐方案：使用 Secret（更安全）

Secret 是推荐的方式，因为：
- API Key 不会以明文形式存储
- 更符合安全最佳实践

## 常见问题排查

### 问题 1: Secret 设置后仍然报错

**原因**：设置 Secret 后没有重新部署 Functions。

**解决**：执行 `firebase deploy --only functions`

### 问题 2: 权限错误

**原因**：当前账号没有权限设置 Secrets。

**解决**：
```bash
# 确认当前登录的账号
firebase login:list

# 如果需要，重新登录
firebase login
```

### 问题 3: API Key 无效

**原因**：API Key 本身有问题或已过期。

**解决**：
1. 在 [Google Cloud Console](https://console.cloud.google.com/) 检查 API Key 状态
2. 确认 Gemini API 已启用
3. 确认 API Key 有正确的权限

## 验证修复

修复后，在 Admin Panel 中再次尝试上传 Fact Sheet 图片，应该不再出现 500 错误。

如果仍有问题，检查浏览器控制台的完整错误信息，并查看 Firebase Functions 日志：

```bash
firebase functions:log --only extractListing --limit 50
```
