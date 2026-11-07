import { describe, expect, it } from 'vitest';
import firebase from './firebase.json';

// E2E は開発サーバーで流すので、公開するページだけに付くヘッダーは、ここで設定を読んで確かめる
const headers =
  firebase.hosting.headers.find(({ source }) => source === '**')?.headers ?? [];

// 順番や区切りの空白が変わっても同じに読めるよう、ディレクティブごとに分けて、空白をそろえる
const cspDirectives =
  headers
    .find(({ key }) => key === 'Content-Security-Policy')
    ?.value.split(';')
    .map((directive) => directive.trim().replace(/\s+/g, ' ')) ?? [];

describe('firebase.json の、すべてのパスに付けるヘッダー', () => {
  it("CSP の connect-src を 'none' だけにして、通信を止める", () => {
    expect(cspDirectives).toContain("connect-src 'none'");
  });

  it("CSP の frame-ancestors を 'none' だけにして、ほかのサイトの iframe に埋め込ませない", () => {
    expect(cspDirectives).toContain("frame-ancestors 'none'");
  });

  it('X-Content-Type-Options を nosniff にして、ファイルの種類を推測させない', () => {
    expect(headers).toContainEqual({
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    });
  });
});
