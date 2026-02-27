# Google Maps API 配置指南

## 问题诊断

如果看到错误信息 "This page can't load Google Maps correctly"，通常是因为：

1. **缺少 Google Maps API Key**
2. **API Key 未启用 Maps JavaScript API**
3. **API Key 有域名限制（localhost 未允许）**
4. **计费账户未启用**

## 解决步骤

### 步骤 1: 获取 Google Maps API Key

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建项目（可以使用现有的 Firebase 项目 `oscar-property-1cc52`）
3. 导航到 **APIs & Services** > **Credentials**
4. 点击 **+ CREATE CREDENTIALS** > **API Key**
5. 复制生成的 API Key

### 步骤 2: 启用 Maps JavaScript API

1. 在 Google Cloud Console 中，导航到 **APIs & Services** > **Library**
2. 搜索 "Maps JavaScript API"
3. 点击并启用该 API

### 步骤 3: 配置 API Key 限制（推荐用于生产环境）

1. 在 **Credentials** 页面，点击你的 API Key
2. 在 **API restrictions** 部分：
   - 选择 "Restrict key"
   - 选择 "Maps JavaScript API"
3. 在 **Application restrictions** 部分：
   - 选择 "HTTP referrers (web sites)"
   - 添加以下允许的域名：
     ```
     localhost:3000/*
     http://localhost:3000/*
     https://localhost:3000/*
     127.0.0.1:3000/*
     http://127.0.0.1:3000/*
     ```
   - 如果已部署，添加生产域名：
     ```
     oscaryan.my/*
     https://oscaryan.my/*
     ```

### 步骤 4: 启用计费账户

⚠️ **重要**: Google Maps Platform 需要启用计费账户，但提供 $200/月的免费额度（通常足够小型网站使用）

1. 在 Google Cloud Console 中，导航到 **Billing**
2. 关联一个计费账户
3. 确认计费账户已启用

### 步骤 5: 配置环境变量

创建 `.env` 文件（如果不存在）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加你的 Google Maps API Key：

```env
VITE_GOOGLE_MAPS_API_KEY=你的_API_Key_在这里
```

### 步骤 6: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

## 验证配置

1. 打开浏览器访问 `http://localhost:3000`
2. 滚动到地图部分
3. 如果配置正确，应该能看到交互式地图
4. 打开浏览器开发者工具（F12），检查 Console 是否有错误

## 常见错误及解决方案

### 错误: "This page can't load Google Maps correctly"

**原因**: API Key 缺失或配置错误

**解决**:
- 检查 `.env` 文件是否存在且包含 `VITE_GOOGLE_MAPS_API_KEY`
- 确认 API Key 已启用 Maps JavaScript API
- 检查 API Key 限制是否允许 localhost

### 错误: "RefererNotAllowedMapError"

**原因**: API Key 的域名限制不允许当前域名

**解决**:
- 在 Google Cloud Console 中添加当前域名到允许列表
- 对于开发环境，确保添加了 `localhost:3000/*`

### 错误: "This API project is not authorized to use this API"

**原因**: Maps JavaScript API 未启用

**解决**:
- 在 Google Cloud Console 中启用 Maps JavaScript API

## 成本说明

Google Maps Platform 提供：
- **$200/月免费额度**
- 通常足够支持每月约 28,000 次地图加载
- 小型网站通常不会超出免费额度

## 测试 API Key

可以使用以下 URL 测试 API Key 是否有效：

```
https://maps.googleapis.com/maps/api/js?key=你的_API_Key&callback=initMap
```

如果返回 JavaScript 代码而不是错误，说明 API Key 有效。
