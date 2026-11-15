#!/bin/sh
# フックから呼ばれる入口。mise の PATH が通っていないシェルでも動くよう、node を順に探す
script="$(dirname "$0")/pre-push-review.ts"

if command -v node >/dev/null 2>&1; then
  exec node "$script"
elif command -v mise >/dev/null 2>&1; then
  exec mise exec -- node "$script"
elif [ -x "$HOME/.local/bin/mise" ]; then
  exec "$HOME/.local/bin/mise" exec -- node "$script"
fi

# 2 で終わると Bash のコマンドがすべて止まるので、1（止めずに知らせる）で終わる
echo 'pre-push-review: node が見つからず、push 前の見直しを確かめられません' >&2
exit 1
