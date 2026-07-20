#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_root/.agents/skills"
targets=(
  "$repo_root/.claude/skills"
  "$repo_root/.codex/skills"
)

if [[ ! -d "$source_dir" ]]; then
  echo "Missing source skills directory: $source_dir" >&2
  exit 1
fi

sync_target() {
  local target_dir="$1"
  mkdir -p "$target_dir"

  local source_skill
  for source_skill in "$source_dir"/*; do
    [[ -d "$source_skill" ]] || continue

    local skill_name
    skill_name="$(basename "$source_skill")"

    local target_skill="$target_dir/$skill_name"
    rm -rf "$target_skill"
    mkdir -p "$target_skill"
    rsync -a --delete "$source_skill/" "$target_skill/"
  done

  local target_skill
  for target_skill in "$target_dir"/*; do
    [[ -e "$target_skill" || -L "$target_skill" ]] || continue

    local skill_name
    skill_name="$(basename "$target_skill")"

    if [[ ! -d "$source_dir/$skill_name" ]]; then
      rm -rf "$target_skill"
    fi
  done
}

for target in "${targets[@]}"; do
  sync_target "$target"
done

echo "Synced skills from .agents/skills to .claude/skills and .codex/skills"
