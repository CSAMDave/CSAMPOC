#!/usr/bin/env bash
set -euo pipefail

# Codex Manual Setup Script: .NET 8 Blazor Website
# - Verifies .NET 8 SDK
# - Creates a Blazor project (Blazor Web App by default)
# - Restores/builds/runs quick validation
# - Writes a local developer bootstrap helper

PROJECT_NAME="AssetInspectionBlazor"
OUTPUT_DIR="$(pwd)"
TEMPLATE="blazor"
INTERACTIVE_MODE="server"
RUN_VALIDATION="true"

usage() {
  cat <<USAGE
Usage: $0 [options]

Options:
  -n, --name <project-name>         Project name (default: ${PROJECT_NAME})
  -o, --output <directory>          Output directory (default: current directory)
  -t, --template <blazor|blazorwasm>
                                    Template to create (default: ${TEMPLATE})
  -m, --mode <server|wasm|auto>     For 'blazor' template: interactive render mode
                                    (default: ${INTERACTIVE_MODE})
      --no-validate                 Skip restore/build/run validation
  -h, --help                        Show this help

Examples:
  $0 --name OpsPortal
  $0 --name OpsPortal --output /workspace --template blazor --mode auto
  $0 --name OpsPortal.Client --template blazorwasm
USAGE
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: Required command '$1' not found." >&2
    exit 1
  }
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -n|--name)
        PROJECT_NAME="$2"; shift 2 ;;
      -o|--output)
        OUTPUT_DIR="$2"; shift 2 ;;
      -t|--template)
        TEMPLATE="$2"; shift 2 ;;
      -m|--mode)
        INTERACTIVE_MODE="$2"; shift 2 ;;
      --no-validate)
        RUN_VALIDATION="false"; shift ;;
      -h|--help)
        usage; exit 0 ;;
      *)
        echo "ERROR: Unknown argument '$1'" >&2
        usage
        exit 1 ;;
    esac
  done
}

validate_inputs() {
  case "$TEMPLATE" in
    blazor|blazorwasm) ;;
    *) echo "ERROR: --template must be one of: blazor, blazorwasm" >&2; exit 1 ;;
  esac

  case "$INTERACTIVE_MODE" in
    server|wasm|auto) ;;
    *) echo "ERROR: --mode must be one of: server, wasm, auto" >&2; exit 1 ;;
  esac

  mkdir -p "$OUTPUT_DIR"
}

ensure_dotnet8() {
  require_cmd dotnet

  local sdk_major
  sdk_major="$(dotnet --version | cut -d. -f1)"
  if [[ "$sdk_major" -lt 8 ]]; then
    echo "ERROR: .NET 8 SDK or newer is required. Found: $(dotnet --version)" >&2
    echo "Install from: https://dotnet.microsoft.com/download/dotnet/8.0" >&2
    exit 1
  fi

  echo "Detected .NET SDK: $(dotnet --version)"
}

create_project() {
  local project_path="${OUTPUT_DIR}/${PROJECT_NAME}"

  if [[ -e "$project_path" ]]; then
    echo "ERROR: Target path already exists: $project_path" >&2
    exit 1
  fi

  echo "Creating project at: $project_path"

  if [[ "$TEMPLATE" == "blazor" ]]; then
    dotnet new blazor \
      --name "$PROJECT_NAME" \
      --output "$project_path" \
      --interactivity "$INTERACTIVE_MODE"
  else
    dotnet new blazorwasm \
      --name "$PROJECT_NAME" \
      --output "$project_path"
  fi

  echo "Project created successfully."
}

write_bootstrap_helper() {
  local project_path="${OUTPUT_DIR}/${PROJECT_NAME}"
  local helper_path="${project_path}/bootstrap-dev.sh"

  cat > "$helper_path" <<'HELPER'
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "[1/3] Restoring dependencies..."
dotnet restore

echo "[2/3] Building solution..."
dotnet build

echo "[3/3] Running app on http://localhost:5100 ..."
dotnet run --urls http://localhost:5100
HELPER

  chmod +x "$helper_path"
  echo "Wrote helper: $helper_path"
}

run_validation() {
  local project_path="${OUTPUT_DIR}/${PROJECT_NAME}"
  cd "$project_path"

  echo "Validating restore/build..."
  dotnet restore
  dotnet build --no-restore

  echo "Smoke test: start app briefly..."
  dotnet run --urls http://localhost:5100 >/tmp/${PROJECT_NAME}.run.log 2>&1 &
  local run_pid=$!

  sleep 6
  if curl -fsSI http://127.0.0.1:5100 >/dev/null 2>&1; then
    echo "Runtime check passed: app responded on http://127.0.0.1:5100"
  else
    echo "WARNING: App did not respond during smoke test. Check /tmp/${PROJECT_NAME}.run.log"
  fi

  kill "$run_pid" >/dev/null 2>&1 || true
  wait "$run_pid" 2>/dev/null || true
}

main() {
  parse_args "$@"
  validate_inputs
  ensure_dotnet8
  create_project
  write_bootstrap_helper

  if [[ "$RUN_VALIDATION" == "true" ]]; then
    run_validation
  fi

  cat <<DONE

Manual setup complete.

Next steps:
  cd "${OUTPUT_DIR}/${PROJECT_NAME}"
  ./bootstrap-dev.sh

DONE
}

main "$@"
