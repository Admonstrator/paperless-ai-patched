#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DOCKER_BIN="${DOCKER_BIN:-docker}"
IMAGE_REPO="${IMAGE_REPO:-${LOCAL_NAMESPACE:-docker.io/library/paperless-ai-next}}"
FORCE_REBUILD="${FORCE_REBUILD:-false}"

BASE_FULL_IMAGE="${BASE_FULL_IMAGE:-${IMAGE_REPO}:latest-base-full}"
BASE_LITE_IMAGE="${BASE_LITE_IMAGE:-${IMAGE_REPO}:latest-base-lite}"
APP_FULL_IMAGE="${APP_FULL_IMAGE:-${IMAGE_REPO}:latest-full}"
APP_LITE_IMAGE="${APP_LITE_IMAGE:-${IMAGE_REPO}:latest-lite}"

if command -v git >/dev/null 2>&1; then
  COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
else
  COMMIT_SHA="unknown"
fi

BUILD_FLAGS=()

refresh_build_flags() {
  BUILD_FLAGS=()
  if [[ "$FORCE_REBUILD" == "true" ]]; then
    BUILD_FLAGS+=(--no-cache --pull)
  fi
}

toggle_force_rebuild() {
  if [[ "$FORCE_REBUILD" == "true" ]]; then
    FORCE_REBUILD="false"
  else
    FORCE_REBUILD="true"
  fi
  refresh_build_flags
}

print_header() {
  echo
  echo "=============================================="
  echo " paperless-ai-next image builder"
  echo "=============================================="
  echo " Base full: ${BASE_FULL_IMAGE}"
  echo " Base lite: ${BASE_LITE_IMAGE}"
  echo " App full : ${APP_FULL_IMAGE}"
  echo " App lite : ${APP_LITE_IMAGE}"
  echo " Commit   : ${COMMIT_SHA}"
  echo " Cache    : $([[ "$FORCE_REBUILD" == "true" ]] && echo "force rebuild (--no-cache --pull)" || echo "normal build")"
  echo
}

ensure_docker() {
  if ! command -v "$DOCKER_BIN" >/dev/null 2>&1; then
    echo "Error: Docker CLI not found (${DOCKER_BIN})." >&2
    exit 1
  fi

  if ! "$DOCKER_BIN" info >/dev/null 2>&1; then
    echo "Error: Docker daemon is not reachable. Start Docker first." >&2
    exit 1
  fi
}

build_base_full() {
  echo "\n[1/1] Building full base image: ${BASE_FULL_IMAGE}"
  "$DOCKER_BIN" build \
    "${BUILD_FLAGS[@]+"${BUILD_FLAGS[@]}"}" \
    -f Dockerfile.base.full \
    -t "${BASE_FULL_IMAGE}" \
    .
  echo "Done: ${BASE_FULL_IMAGE}"
}

build_base_lite() {
  echo "\n[1/1] Building lite base image: ${BASE_LITE_IMAGE}"
  "$DOCKER_BIN" build \
    "${BUILD_FLAGS[@]+"${BUILD_FLAGS[@]}"}" \
    -f Dockerfile.base.lite \
    -t "${BASE_LITE_IMAGE}" \
    .
  echo "Done: ${BASE_LITE_IMAGE}"
}

build_app_full() {
  echo "\n[1/1] Building full app image: ${APP_FULL_IMAGE}"
  "$DOCKER_BIN" build \
    "${BUILD_FLAGS[@]+"${BUILD_FLAGS[@]}"}" \
    -f Dockerfile \
    --build-arg BASE_IMAGE="${BASE_FULL_IMAGE}" \
    --build-arg PAPERLESS_AI_COMMIT_SHA="${COMMIT_SHA}" \
    -t "${APP_FULL_IMAGE}" \
    .
  echo "Done: ${APP_FULL_IMAGE}"
}

build_app_lite() {
  echo "\n[1/1] Building lite app image: ${APP_LITE_IMAGE}"
  "$DOCKER_BIN" build \
    "${BUILD_FLAGS[@]+"${BUILD_FLAGS[@]}"}" \
    -f Dockerfile.lite \
    --build-arg BASE_IMAGE="${BASE_LITE_IMAGE}" \
    --build-arg PAPERLESS_AI_COMMIT_SHA="${COMMIT_SHA}" \
    -t "${APP_LITE_IMAGE}" \
    .
  echo "Done: ${APP_LITE_IMAGE}"
}

show_compose_usage() {
  cat <<EOF

How to use the built image in docker-compose.yml:

Full image (with RAG):
services:
  paperless-ai:
    image: ${APP_FULL_IMAGE}
    pull_policy: never
    container_name: paperless-ai-next
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - paperless-ai-next_data:/app/data

Lite image (without RAG):
services:
  paperless-ai:
    image: ${APP_LITE_IMAGE}
    pull_policy: never
    container_name: paperless-ai-next
    restart: unless-stopped
    environment:
      - RAG_SERVICE_ENABLED=false
    ports:
      - "3000:3000"
    volumes:
      - paperless-ai-next_data:/app/data

Then start/recreate:
  docker compose up -d --force-recreate

Tip:
- Keep pull_policy: never for local images.
- If your service still has a build: section, remove or comment it out when using image:.
EOF
}

run_action() {
  local action="${1:-menu}"

  case "$action" in
    base-full)
      build_base_full
      ;;
    base-lite)
      build_base_lite
      ;;
    base-all)
      build_base_full
      build_base_lite
      ;;
    app-full)
      build_app_full
      show_compose_usage
      ;;
    app-lite)
      build_app_lite
      show_compose_usage
      ;;
    app-all)
      build_app_full
      build_app_lite
      show_compose_usage
      ;;
    all)
      build_base_full
      build_base_lite
      build_app_full
      build_app_lite
      show_compose_usage
      ;;
    menu)
      while true; do
        print_header
        echo "Select build target:"
        echo "  0) Toggle force rebuild without cache"
        echo "  1) Build base image (full)"
        echo "  2) Build base image (lite)"
        echo "  3) Build base images (full + lite)"
        echo "  4) Build app image (full)"
        echo "  5) Build app image (lite)"
        echo "  6) Build app images (full + lite)"
        echo "  7) Build everything (base + app)"
        echo "  8) Show docker-compose usage"
        echo "  9) Exit"
        read -r -p "Choice [0-9]: " choice

        case "$choice" in
          0) toggle_force_rebuild ;;
          1) build_base_full ;;
          2) build_base_lite ;;
          3) build_base_full; build_base_lite ;;
          4) build_app_full; show_compose_usage ;;
          5) build_app_lite; show_compose_usage ;;
          6) build_app_full; build_app_lite; show_compose_usage ;;
          7) build_base_full; build_base_lite; build_app_full; build_app_lite; show_compose_usage ;;
          8) show_compose_usage ;;
          9) echo "Bye."; break ;;
          *) echo "Invalid choice." ;;
        esac

        echo
        read -r -p "Press Enter to continue..." _
      done
      ;;
    *)
      cat <<EOF
Unknown argument: ${action}

Usage:
  ./build.sh               # interactive menu
  ./build.sh menu
  ./build.sh --no-cache menu
  ./build.sh base-full|base-lite|base-all
  ./build.sh app-full|app-lite|app-all
  ./build.sh all

Optional overrides:
  FORCE_REBUILD=true ./build.sh all
  IMAGE_REPO=docker.io/library/myrepo ./build.sh all
  LOCAL_NAMESPACE=myrepo ./build.sh all
  BASE_FULL_IMAGE=my/base:full BASE_LITE_IMAGE=my/base:lite ./build.sh base-all
  APP_FULL_IMAGE=my/app:full APP_LITE_IMAGE=my/app:lite ./build.sh app-all
EOF
      exit 1
      ;;
  esac
}

ensure_docker

ACTION="menu"
for arg in "$@"; do
  case "$arg" in
    --no-cache)
      FORCE_REBUILD="true"
      ;;
    --cache)
      FORCE_REBUILD="false"
      ;;
    menu|base-full|base-lite|base-all|app-full|app-lite|app-all|all)
      ACTION="$arg"
      ;;
    *)
      run_action "$arg"
      exit 1
      ;;
  esac
done

refresh_build_flags
run_action "$ACTION"
