#!/usr/bin/env bash
#
# update-server.sh — Push local changes to production server and redeploy
#
# Usage:
#   ./scripts/update-server.sh          # push changes + rebuild + restart
#   ./scripts/update-server.sh sync     # only sync files, no rebuild
#   ./scripts/update-server.sh restart  # only rebuild + restart (no sync)
#   ./scripts/update-server.sh logs     # tail server logs
#   ./scripts/update-server.sh status   # check server container status
#
set -e

SERVER="root@121.43.140.76"
REMOTE_DIR="/opt/deer-flow"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

sync_code() {
    echo -e "${BLUE}Syncing code to $SERVER...${NC}"
    tar czf - \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='backend/.deer-flow' \
        --exclude='logs' \
        . | ssh "$SERVER" "cd $REMOTE_DIR && tar xzf -"
    echo -e "${GREEN}✓ Code synced${NC}"
}

deploy() {
    echo -e "${BLUE}Building and restarting containers...${NC}"
    ssh "$SERVER" "cd $REMOTE_DIR && bash scripts/deploy.sh start"
    echo -e "${GREEN}✓ Deployment complete${NC}"
    echo ""
    echo "  App: http://121.43.140.76"
    echo "       http://deerflow.lianhaikeji.com"
}

show_logs() {
    ssh "$SERVER" "cd $REMOTE_DIR && docker compose -p deer-flow -f docker/docker-compose.yaml logs --tail=50"
}

show_status() {
    ssh "$SERVER" "cd $REMOTE_DIR && docker compose -p deer-flow -f docker/docker-compose.yaml ps"
}

case "${1:-}" in
    sync)
        sync_code
        ;;
    restart)
        deploy
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    "")
        sync_code
        deploy
        ;;
    *)
        echo "Usage: $0 [sync|restart|logs|status]"
        exit 1
        ;;
esac
