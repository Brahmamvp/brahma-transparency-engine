#!/usr/bin/env bash
set -e
git add -A
git commit -m "sync" || true
git push
echo "✅ Synced to GitHub."
