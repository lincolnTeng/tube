#!/bin/bash

COMMIT_MESSAGE="$1"

if [ -z "$COMMIT_MESSAGE" ]; then
  echo "Usage: $0 <commit_message>"
  exit 1
fi

git pull daytube main

git add .

git commit -m "$COMMIT_MESSAGE"

git push daytube HEAD:main

echo "Space directory updated and pushed to GitHub."



