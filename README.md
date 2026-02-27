<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js

### 快速启动

1. **安装依赖**（如果还未安装）:
   ```bash
   npm install
   ```

2. **设置环境变量**:
   - 已从 `.env.example` 创建 `.env` 文件
   - **重要**: 需要配置 Google Maps API Key 才能使用地图功能
   - 编辑 `.env` 文件，将 `VITE_GOOGLE_MAPS_API_KEY` 设置为你的 Google Maps API Key
   - 详细配置步骤请参考 `GOOGLE_MAPS_SETUP.md`

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

4. **访问预览**:
   打开浏览器访问: **http://localhost:3000**

### 启动说明

- 开发服务器会在端口 **3000** 上运行
- 支持热重载，修改代码后会自动刷新
- 按 `Ctrl+C` 停止服务器

### 如果遇到连接问题

如果看到 `ERR_CONNECTION_REFUSED` 错误：
1. 确保开发服务器正在运行（检查终端输出）
2. 确认端口 3000 未被其他程序占用
3. 尝试重新启动服务器

### Google Maps 地图无法加载？

如果看到 "This page can't load Google Maps correctly" 错误：
1. **检查 `.env` 文件**：确保 `VITE_GOOGLE_MAPS_API_KEY` 已设置
2. **获取 API Key**：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 启用 "Maps JavaScript API"
   - 创建 API Key 并配置域名限制（允许 `localhost:3000`）
3. **详细步骤**：请参考 `GOOGLE_MAPS_SETUP.md` 文件
4. **重启服务器**：修改 `.env` 后需要重启开发服务器
