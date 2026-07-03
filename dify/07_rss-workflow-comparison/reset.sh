#!/bin/bash
cd "$(dirname "$0")"
docker compose down
rm -rf dify_data/postgres
docker compose up -d
echo "Done. Wait 30 seconds then open http://localhost:8080"
