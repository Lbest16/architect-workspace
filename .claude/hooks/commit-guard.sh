#!/usr/bin/env bash
# PreToolUse hook: blocks a small set of destructive commands.
# Not wired into settings.json yet.
set -euo pipefail

# 1. Read the JSON payload the harness pipes on stdin.
payload="$(cat)"

# jq is not installed on this machine; node is (and this is already a
# node/TS project), so JSON.parse via node is the dependency-free reader.
command="$(node -e '
let data = "";
process.stdin.on("data", chunk => { data += chunk; });
process.stdin.on("end", () => {
  let value = "";
  try {
    const payload = JSON.parse(data);
    if (payload && payload.tool_input && typeof payload.tool_input.command === "string") {
      value = payload.tool_input.command;
    }
  } catch (err) {
    value = "";
  }
  process.stdout.write(value);
});
' <<< "$payload")"

# 2. Decide.
if [[ "$command" == *"git push --force"* || "$command" == *"rm -rf /"* ]]; then
  echo "commit-guard: blocked — command matches a forbidden pattern (git push --force / rm -rf /): $command" >&2
  exit 2
fi

# 3. Otherwise, proceed.
exit 0
