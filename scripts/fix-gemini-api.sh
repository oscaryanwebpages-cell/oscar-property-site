#!/bin/bash

# 修复 Gemini API Key 配置脚本
# 用途：设置 Firebase Secret 并重新部署 Functions

set -e

PROJECT_ROOT="/Users/ginooh/Documents/OscarYan（property agent）"
cd "$PROJECT_ROOT"

echo "🔍 检查当前配置..."
echo ""

# 检查 .env 文件是否存在
if [ -f "functions/.env" ]; then
    echo "✅ 找到 functions/.env 文件"
    if grep -q "GEMINI_API_KEY" functions/.env; then
        API_KEY=$(grep "GEMINI_API_KEY" functions/.env | cut -d '=' -f2)
        echo "📋 找到 API Key: ${API_KEY:0:20}..."
    else
        echo "❌ functions/.env 中没有找到 GEMINI_API_KEY"
        exit 1
    fi
else
    echo "❌ 未找到 functions/.env 文件"
    exit 1
fi

echo ""
echo "🔐 设置 Firebase Secret..."
echo "提示：如果已设置过，这将更新现有的 Secret"
echo ""

# 设置 Secret
firebase functions:secrets:set GEMINI_API_KEY

echo ""
echo "✅ Secret 设置完成"
echo ""

# 验证 Secret
echo "🔍 验证 Secret..."
if firebase functions:secrets:access GEMINI_API_KEY > /dev/null 2>&1; then
    echo "✅ Secret 验证成功"
else
    echo "⚠️  Secret 验证失败，但继续部署..."
fi

echo ""
echo "📦 构建 Functions..."
cd functions
npm run build

echo ""
echo "🚀 部署 Functions..."
cd ..
firebase deploy --only functions

echo ""
echo "✅ 完成！"
echo ""
echo "📝 查看日志（可选）："
echo "   firebase functions:log --only extractListing --limit 10"
echo ""
echo "🧪 测试：在 Admin Panel 中再次尝试上传 Fact Sheet 图片"
