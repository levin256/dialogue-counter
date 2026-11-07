import { describe, expect, it } from 'vitest';
import firebase from './firebase.json';

// E2E は開発サーバーで流すので、公開するページだけに付くヘッダーは、ここで設定を読んで確かめる
const headers =
  firebase.hosting.headers.find((entry) => entry.source === '**')?.headers ??
  [];

function headerValue(key: string) {
  return headers.find((header) => header.key === key)?.value;
}

// ディレクティブの名前ごとに値を分ける。順番や区切りの空白が変わっても、同じに読めるようにする
function parseCsp(csp: string) {
  const directives = new Map<string, string[]>();
  for (const directive of csp.split(';')) {
    const [name, ...values] = directive.trim().split(/\s+/);
    if (name) directives.set(name.toLowerCase(), values);
  }
  return directives;
}

describe('parseCsp', () => {
  it('順番や区切りの空白が変わっても、同じに読む', () => {
    expect(parseCsp("a 'none'; b x y")).toEqual(
      parseCsp("  b  x   y ;a 'none';"),
    );
  });
});

describe('firebase.json の、すべてのパスに付けるヘッダー', () => {
  const csp = parseCsp(headerValue('Content-Security-Policy') ?? '');

  it("CSP の connect-src を 'none' だけにして、通信を止める", () => {
    expect(csp.get('connect-src')).toEqual(["'none'"]);
  });

  it("CSP の frame-ancestors を 'none' だけにして、ほかのサイトの iframe に埋め込ませない", () => {
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
  });

  it('X-Content-Type-Options を nosniff にして、ファイルの種類を推測させない', () => {
    expect(headerValue('X-Content-Type-Options')).toBe('nosniff');
  });
});
