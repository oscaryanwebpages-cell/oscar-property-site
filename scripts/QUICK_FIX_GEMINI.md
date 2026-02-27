# 🔧 快速修复 Gemini API Key 问题

## 问题
`extractListing` 函数返回 500 错误，原因是 Firebase Functions 中的 `GEMINI_API_KEY` Secret 未正确配置。

## ⚡ 快速修复（3 步）

### 步骤 1: 设置 Firebase Secret

```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"
firebase functions:secrets:set GEMINI_API_KEY
```

**按提示输入你的 API Key**（从 `functions/.env` 文件中复制）：
```
AIzaSyADWo32hBMatp4px715sqKHPUxjF1srJXQ
```

### 步骤 2: 重新部署 Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 步骤 3: 验证

在 Admin Panel 中再次尝试上传 Fact Sheet 图片。

---

## 🚀 或使用自动化脚本

```bash
cd "/Users/ginooh/Documents/OscarYan（property agent）"
./scripts/fix-gemini-api.sh
```

---

## 🔍 验证 Secret 是否设置成功

```bash
# 查看 Secret（会显示值）
firebase functions:secrets:access GEMINI_API_KEY

# 或列出所有 Secrets
firebase functions:secrets:list
```

---

## 📋 查看错误日志

如果仍有问题，查看详细日志：

```bash
firebase functions:log --only extractListing --limit 20
```

---

## ⚠️ 常见问题

### Q: Secret 设置后仍然报错？
**A**: 设置 Secret 后**必须重新部署** Functions 才能生效。

### Q: 如何确认当前部署的区域？
**A**: 代码中设置为 `us-central1`，这是正常的。如果需要更改，修改 `functions/src/index.ts` 第 45 行。

### Q: API Key 无效怎么办？
**A**: 
1. 检查 [Google Cloud Console](https://console.cloud.google.com/) 中 API Key 状态
2. 确认 Gemini API 已启用
3. 确认 API Key 有正确的权限和配额

---

## 📝 详细说明

完整修复指南请参考：`scripts/FIX_GEMINI_API_KEY.md`
