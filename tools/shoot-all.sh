#!/usr/bin/env bash
# Shoot every site in tools/sites.tsv, three at a time. Pass slugs to shoot only those.
cd "$(dirname "$0")/.."
grep -v '^#' tools/sites.tsv | grep -v '^\s*$' | while IFS=$'\t' read -r group slug url opts; do
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $slug " ]]; then continue; fi
  printf '%s\t%s\t%s\n' "$slug" "$url" "$opts"
done | xargs -P 3 -L 1 bash -c 'node tools/shoot.mjs "$0" "$1" ${@:2} 2>&1 | tail -1'
