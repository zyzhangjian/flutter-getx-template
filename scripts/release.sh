#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: npm run release -- [--dry-run] <publish|patch|minor|major|version>

Examples:
  VSCE_PAT=... npm run release -- publish
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
  publish|patch|minor|major|[0-9]*.[0-9]*.[0-9]*) ;;
  *)
    echo "Version must be publish, patch, minor, major, or an x.y.z semantic version." >&2
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
  if [[ "$version" == "publish" ]]; then
    echo "Dry run: use the current package.json version"
  else
    echo "Dry run: npm version $version --no-git-tag-version"
  fi
  echo "Dry run: npx --no-install vsce package --out release/<name>-<version>.vsix"
  echo "Dry run: npx --no-install vsce publish --packagePath release/<name>-<version>.vsix"
  exit 0
fi

npm run lint
npm run compile-tests
if [[ "$version" != "publish" ]]; then
  npm version "$version" --no-git-tag-version
fi

package_name="$(node -p "require('./package.json').name")"
package_version="$(node -p "require('./package.json').version")"
package_path="release/${package_name}-${package_version}.vsix"

mkdir -p release
npx --no-install vsce package --out "$package_path"
npx --no-install vsce publish --packagePath "$package_path" --pat "$VSCE_PAT"

echo "Published ${package_name}@${package_version}: ${package_path}"
