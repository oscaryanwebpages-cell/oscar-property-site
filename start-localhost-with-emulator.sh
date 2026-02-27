#!/bin/bash

# 启动本地开发环境（前端 + Functions 模拟器）

cd "/Users/ginooh/Documents/OscarYan（property agent）"

echo "🚀 启动本地开发环境..."
echo ""
echo "📋 访问地址:"
echo "   - 前端应用: http://localhost:3000"
echo "   - Admin Panel: http://localhost:3000/admin"
echo "   - Functions 模拟器 UI: http://localhost:4000"
echo ""
echo "⚠️  需要两个终端窗口："
echo "   1. 这个窗口运行 Functions 模拟器"
echo "   2. 另一个窗口运行: npm run dev"
echo ""
echo "按 Ctrl+C 停止模拟器"
echo ""

# 构建 Functions
echo "📦 构建 Functions..."
cd functions
npm run build
cd ..

# 启动 Functions 模拟器
echo "🔧 启动 Functions 模拟器..."
firebase emulators:start --only functions
