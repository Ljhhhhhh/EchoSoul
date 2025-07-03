#!/bin/bash

# EchoSoul 开发环境启动脚本

echo "🚀 Starting EchoSoul development environment..."

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# 构建共享包
echo "🔨 Building common package..."
cd packages/common && pnpm build && cd ../..

# 启动开发服务器
echo "🎯 Starting development servers..."
pnpm dev
