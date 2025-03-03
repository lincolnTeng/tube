#!/bin/bash

# 获取提交信息
COMMIT_MESSAGE="$1"

# 检查是否提供了提交信息
if [ -z "$COMMIT_MESSAGE" ]; then
  echo "Usage: $0 <commit_message>"
  exit 1
fi

# 添加所有更改的文件
git add .

# 提交更改
git commit -m "$COMMIT_MESSAGE"

# 推送到 GitHub
git push origin main # 或者你的主分支名称

echo "Update process completed."
