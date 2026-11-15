import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { blockReason, isPush, RECORD_FILE } from './pre-push-review.ts';

describe('isPush', () => {
  it.each([
    'git push',
    'git push -u origin feat/x',
    'git -C ../repo push',
    'cd a && git push --force-with-lease',
  ])('push とみなす: %s', (command) => {
    expect(isPush(command)).toBe(true);
  });

  it.each(['git status', 'git pushd', 'echo pushing', 'gh pr create'])(
    'push とみなさない: %s',
    (command) => {
      expect(isPush(command)).toBe(false);
    },
  );
});

describe('blockReason', () => {
  it('src/ に変更がなければ、止めない', () => {
    expect(
      blockReason({ srcChanged: false, head: 'a', reviewedHead: null }),
    ).toBeNull();
  });

  it('src/ に変更があり、見直していなければ、止める', () => {
    expect(
      blockReason({ srcChanged: true, head: 'a', reviewedHead: null }),
    ).toContain('/pre-push-review');
  });

  it('記録した HEAD が今の HEAD と同じなら、止めない', () => {
    expect(
      blockReason({ srcChanged: true, head: 'a', reviewedHead: 'a' }),
    ).toBeNull();
  });

  it('見直したあとにコミットが増えたら、また止める', () => {
    expect(
      blockReason({ srcChanged: true, head: 'b', reviewedHead: 'a' }),
    ).not.toBeNull();
  });
});

// settings.json と同じく入口の sh から動かす。一時的な git リポジトリで、issue の 4 つの場合を確かめる
describe('フックとして動かしたとき', () => {
  const script = path.join(import.meta.dirname, 'pre-push-review.sh');
  // フックは mise の PATH が通らないシェルで動くことがあるので、最小の PATH に node だけ足す
  const minimalPath = '/usr/bin:/bin';
  let repo: string;

  const git = (...args: string[]) =>
    execFileSync(
      'git',
      [
        '-c',
        'user.name=test',
        '-c',
        'user.email=test@example.com',
        '-c',
        'commit.gpgsign=false',
        ...args,
      ],
      { cwd: repo, encoding: 'utf8', stdio: 'pipe' },
    ).trim();

  const commitFile = (file: string) => {
    mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    writeFileSync(path.join(repo, file), file);
    git('add', '.');
    git('commit', '-m', file);
  };

  const runHook = (
    command: string,
    cwd = repo,
    PATH = `${path.dirname(process.execPath)}:${minimalPath}`,
  ) =>
    spawnSync('/bin/sh', [script], {
      input: JSON.stringify({
        tool_name: 'Bash',
        tool_input: { command },
        cwd,
      }),
      encoding: 'utf8',
      // HOME を一時フォルダにして、~/.local/bin/mise が見つからないようにする
      env: { PATH, HOME: repo },
    });

  beforeAll(() => {
    repo = mkdtempSync(path.join(tmpdir(), 'pre-push-review-'));
    git('init', '-b', 'main');
    commitFile('README.md');
    git('switch', '-c', 'feat');
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  // 順に状態を進めるので、上から順に流す前提
  it('push 以外のコマンドは、止めない', () => {
    commitFile('src/a.ts');
    expect(runHook('git status').status).toBe(0);
  });

  it('src/ に変更がなければ、止めない', () => {
    git('reset', '--hard', 'main');
    commitFile('docs/a.md');
    expect(runHook('git push').status).toBe(0);
  });

  it('src/ に変更があれば、止めて見直すように伝える', () => {
    commitFile('src/a.ts');
    const result = runHook('git push');
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('/pre-push-review');
  });

  it('サブフォルダから push しても、リポジトリ直下の src/ を見る', () => {
    expect(runHook('git push', path.join(repo, 'docs')).status).toBe(2);
  });

  it('見直して HEAD を記録すれば、通す', () => {
    writeFileSync(
      path.join(repo, '.git', RECORD_FILE),
      git('rev-parse', 'HEAD'),
    );
    expect(runHook('git push').status).toBe(0);
  });

  it('記録のあとにコミットすると、また止める', () => {
    commitFile('src/b.ts');
    expect(runHook('git push').status).toBe(2);
  });

  it('node が見つからなければ、Bash を止めずに知らせる', () => {
    const result = runHook('git push', repo, minimalPath);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('node が見つからず');
  });
});
