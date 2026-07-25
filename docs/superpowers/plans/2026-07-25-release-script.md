# Extension Release Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe, repeatable command that validates, versions, packages, and publishes this VS Code extension to the Visual Studio Marketplace.

**Architecture:** A small Bash script owns release orchestration while `package.json` exposes it through `npm run release`. The script requires a Marketplace Personal Access Token from `VSCE_PAT`, uses `npm version` without creating a Git tag, creates a versioned `.vsix` under `release/`, and passes that package to the locally installed `vsce` CLI for publishing.

**Tech Stack:** Bash, npm, `@vscode/vsce`, VS Code Marketplace PAT.

---

## File Structure

- `scripts/release.sh` — validates CLI input and `VSCE_PAT`, runs checks, bumps the extension version, packages the VSIX, and uploads it.
- `package.json` — adds `@vscode/vsce` as a pinned development tool and exposes `npm run release`.
- `.gitignore` — excludes generated `release/` artifacts.
- `README.md` — documents token setup and the release command.

### Task 1: Add the release tool and command entry point

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add a failing command invocation check**

Run: `npm run release -- --help`

Expected: FAIL because the `release` script does not exist yet.

- [ ] **Step 2: Install the Marketplace packaging CLI as a development dependency**

Run:

```bash
npm install --save-dev @vscode/vsce@^3.7.1
```

Expected: `package.json` and `package-lock.json` contain `@vscode/vsce`, so release builds do not depend on a transient `npx` download.

- [ ] **Step 3: Expose the release script and ignore generated packages**

Add this script to `package.json`:

```json
"release": "bash ./scripts/release.sh"
```

Append this line to `.gitignore`:

```gitignore
release/
```

- [ ] **Step 4: Verify the command now finds its script target**

Run: `npm run release -- --help`

Expected: the shell starts `scripts/release.sh`; it will still fail until Task 2 creates that file.

### Task 2: Implement validation, packaging, and publishing

**Files:**
- Create: `scripts/release.sh`

- [ ] **Step 1: Write the failing release-script checks**

Run:

```bash
bash -n scripts/release.sh
VSCE_PAT=placeholder npm run release -- --dry-run patch
```

Expected: FAIL because `scripts/release.sh` does not exist yet.

- [ ] **Step 2: Create the script with the following content**

```bash
#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: npm run release -- [--dry-run] <patch|minor|major|version>

Examples:
  VSCE_PAT=... npm run release -- patch
  VSCE_PAT=... npm run release -- 2.1.0
EOF
}

dry_run=false
if [[ "${1:-}" == "--dry-run" ]]; then
  dry_run=true
  shift
fi

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 1
fi

version="$1"
case "$version" in
  patch|minor|major|[0-9]*.[0-9]*.[0-9]*) ;;
  *)
    echo "Version must be patch, minor, major, or an x.y.z semantic version." >&2
    exit 1
    ;;
esac

if [[ "$dry_run" == false && -z "${VSCE_PAT:-}" ]]; then
  echo "VSCE_PAT is required to publish to the Visual Studio Marketplace." >&2
  exit 1
fi

if [[ "$dry_run" == true ]]; then
  echo "Dry run: npm run lint"
  echo "Dry run: npm run compile-tests"
  echo "Dry run: npm version $version --no-git-tag-version"
  echo "Dry run: npx vsce package --out release/<name>-<version>.vsix"
  echo "Dry run: npx vsce publish --packagePath release/<name>-<version>.vsix"
  exit 0
fi

npm run lint
npm run compile-tests
npm version "$version" --no-git-tag-version

package_name="$(node -p "require('./package.json').name")"
package_version="$(node -p "require('./package.json').version")"
package_path="release/${package_name}-${package_version}.vsix"

mkdir -p release
npx vsce package --out "$package_path"
npx vsce publish --packagePath "$package_path" --pat "$VSCE_PAT"

echo "Published ${package_name}@${package_version}: ${package_path}"
```

- [ ] **Step 3: Make the script executable**

Run:

```bash
chmod +x scripts/release.sh
```

- [ ] **Step 4: Verify syntax and no-side-effect mode**

Run:

```bash
bash -n scripts/release.sh
VSCE_PAT=placeholder npm run release -- --dry-run patch
```

Expected: the syntax check succeeds and dry-run prints all five planned release operations without changing `package.json`, `package-lock.json`, `release/`, or Marketplace state.

- [ ] **Step 5: Verify token protection**

Run:

```bash
env -u VSCE_PAT npm run release -- patch
```

Expected: exit code 1 with `VSCE_PAT is required to publish to the Visual Studio Marketplace.` before version files or packages are changed.

### Task 3: Document the operational release workflow

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a Release section**

Add this documentation near the development commands:

```markdown
## Release

Create a Visual Studio Marketplace Personal Access Token with Marketplace publish permission, then keep it only in your shell environment:

```bash
export VSCE_PAT='your-token'
```

Preview a release without changing files or publishing:

```bash
npm run release -- --dry-run patch
```

Publish a patch, minor, major, or exact semantic version:

```bash
npm run release -- patch
npm run release -- 2.1.0
```

The command runs lint and TypeScript checks, updates the version without creating a Git tag, writes a `.vsix` file to `release/`, then uploads that VSIX to the Visual Studio Marketplace.
```

- [ ] **Step 2: Verify documentation references the actual command**

Run:

```bash
rg -n "VSCE_PAT|npm run release|--dry-run" README.md
```

Expected: all three release concepts appear in the README.

### Task 4: Final verification

**Files:**
- Verify: `scripts/release.sh`
- Verify: `package.json`
- Verify: `README.md`

- [ ] **Step 1: Run the safe verification suite**

Run:

```bash
npm run lint
npm run compile-tests
npm run release -- --help
VSCE_PAT=placeholder npm run release -- --dry-run patch
git diff --check
```

Expected: every command exits successfully, no Marketplace upload occurs, and no whitespace errors are reported.

- [ ] **Step 2: Review release artifact exclusions**

Run:

```bash
git check-ignore -v release/example.vsix
```

Expected: `.gitignore` reports the `release/` rule.

- [ ] **Step 3: Commit when the user requests it**

Do not create a commit automatically because the workspace already contains unrelated user changes. If requested, stage only `scripts/release.sh`, `package.json`, `package-lock.json`, `.gitignore`, and `README.md` after rechecking the diff.
