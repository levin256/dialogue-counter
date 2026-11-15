// Claude Code の PreToolUse フック（Bash）。src/ を変えたブランチを、見直す前に push させない
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// 見直し済みの HEAD を書くファイル。HEAD は worktree ごとなので、worktree ごとの git-dir に置く
export const RECORD_FILE = 'claude-simplified';

export const isPush = (command: string): boolean =>
  /\bgit\s+(?:-C\s+\S+\s+)?push\b/.test(command);

export type PushState = {
  srcChanged: boolean;
  head: string;
  reviewedHead: string | null;
};

// 止めるときは理由を、通すときは null を返す
export const blockReason = ({
  srcChanged,
  head,
  reviewedHead,
}: PushState): string | null => {
  if (!srcChanged || head === reviewedHead) return null;
  return [
    `src/ に変更があり、今の HEAD（${head.slice(0, 7)}）はまだ見直していません。`,
    '/pre-push-review で見直してから、もう一度 push してください。',
  ].join('\n');
};

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

// 手元の main は古いことがあるので、origin/main を先に使う
const mergeBase = (cwd: string): string | null => {
  for (const ref of ['origin/main', 'main']) {
    try {
      return git(cwd, 'merge-base', ref, 'HEAD');
    } catch {}
  }
  return null;
};

const readRecord = (file: string): string | null => {
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    return null;
  }
};

// git のリポジトリでない・基準が見つからないときは、判断できないので null（止めない）
export const readPushState = (cwd: string): PushState | null => {
  let head: string;
  try {
    head = git(cwd, 'rev-parse', 'HEAD');
  } catch {
    return null;
  }
  const base = mergeBase(cwd);
  if (base === null) return null;
  return {
    // :/ を付けて、cwd がサブフォルダでもリポジトリ直下の src/ を見る
    srcChanged:
      git(cwd, 'diff', '--name-only', base, 'HEAD', '--', ':/src/') !== '',
    head,
    reviewedHead: readRecord(
      path.join(git(cwd, 'rev-parse', '--absolute-git-dir'), RECORD_FILE),
    ),
  };
};

const main = () => {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  if (!isPush(input.tool_input?.command ?? '')) return;
  const state = readPushState(input.cwd);
  const reason = state && blockReason(state);
  if (reason) {
    // 終了コード 2 で、標準エラーの内容が Claude に返り、コマンドは実行されない
    process.stderr.write(reason);
    process.exitCode = 2;
  }
};

if (import.meta.main) main();
