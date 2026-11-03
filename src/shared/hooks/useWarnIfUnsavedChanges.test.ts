import { describe, it } from 'vitest';

// このフックの中身は、すべて useEffect の中（beforeunload の登録と解除）なので、
// React を描く環境（Testing Library の renderHook と、ブラウザか jsdom）がないとテストできない。
// 単体テストはブラウザのない Node で動かしていて、その環境はまだ入れていないので、入れるまで todo にしておく。
// E2E でもまだ確かめていない。
describe('useWarnIfUnsavedChanges', () => {
  it.todo('未保存の入力があるときは、ページを離れる前に確認を出す');
  it.todo('未保存の入力がないときは、確認を出さない');
  it.todo('部品が消えたら、beforeunload の登録を外す');
});
