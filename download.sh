#!/usr/bin/env bash

set -euxo pipefail

filename=README.md

body=$(gh run list -b artifact -L 1 --json headSha,databaseId --jq '.[0]')
run_id=$(echo "$body" | jq -r ".databaseId")
head_sha=$(echo "$body" | jq -r ".headSha")

echo "body: $body" >&2
echo "run_id: $run_id" >&2
echo "head_sha: $head_sha" >&2

tempdir=$(mktemp -d)
echo "tempdir: $tempdir" >&2

gh run download -D "$tempdir" -n "artifact" "$run_id"
ls "$tempdir"
tree "$tempdir"
cat "$tempdir/$filename"
