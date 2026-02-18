# Codex Manual Setup Script — .NET 8 Blazor Website

This repository includes:

- `codex-manual-setup-dotnet8-blazor.sh`

## What it does

1. Verifies `dotnet` is installed and SDK major version is 8+.
2. Creates a new Blazor project:
   - `blazor` (default) or
   - `blazorwasm`
3. Adds a project-local `bootstrap-dev.sh` helper.
4. Optionally validates with restore/build and a quick runtime smoke test.

## Usage

```bash
./codex-manual-setup-dotnet8-blazor.sh --name OpsPortal
```

### Options

- `--name, -n`: project name (default `AssetInspectionBlazor`)
- `--output, -o`: output directory (default current directory)
- `--template, -t`: `blazor` or `blazorwasm` (default `blazor`)
- `--mode, -m`: for `blazor`, interactive mode `server|wasm|auto` (default `server`)
- `--no-validate`: skip restore/build/runtime smoke test

## Examples

```bash
# Default Blazor Web App (server interactivity)
./codex-manual-setup-dotnet8-blazor.sh --name AssetOps

# Blazor Web App with auto interactivity in a custom output path
./codex-manual-setup-dotnet8-blazor.sh --name AssetOps --output /workspace --template blazor --mode auto

# Blazor WebAssembly template
./codex-manual-setup-dotnet8-blazor.sh --name AssetOps.Client --template blazorwasm
```
