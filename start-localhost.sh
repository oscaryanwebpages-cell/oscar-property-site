#!/bin/bash

# 部署到 localhost：启动前端开发服务器

cd "/Users/ginooh/Documents/OscarYan（property agent）"

echo "🚀 部署到 localhost..."
echo ""
echo "📋 启动后访问:"
echo "   - 前端应用: http://localhost:3000"
echo "   - Admin Panel: http://localhost:3000/admin"
echo "   - Functions 模拟器 UI: http://localhost:4000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
