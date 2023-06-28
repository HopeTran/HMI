#!/usr/bin/env sh

echo "Cleanup"

set -x
docker image prune -f
