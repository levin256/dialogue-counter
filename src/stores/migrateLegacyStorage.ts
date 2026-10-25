import type { CountRule } from '../utils/string';

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

// 統合前のストアは、除外文字と行の先頭文字を別々のキーに、id 付きで保存していた
// 例: { "state": { "ignoreStrings": [{ "id": "...", "ignoreString": "。" }] }, "version": 0 }
const LEGACY_STORES = [
  { key: 'ignore-strings', list: 'ignoreStrings', field: 'ignoreString' },
  {
    key: 'ignore-line-prefixes',
    list: 'ignoreLinePrefixes',
    field: 'ignoreLinePrefix',
  },
] as const;

// 旧データから文字列だけを取り出す。読めなければ undefined
const readLegacyList = (
  storage: KeyValueStorage,
  { key, list, field }: (typeof LEGACY_STORES)[number],
) => {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  try {
    const items: unknown = JSON.parse(raw)?.state?.[list];
    if (!Array.isArray(items)) return undefined;
    const values = items
      .map((item) => item?.[field])
      .filter((value): value is string => typeof value === 'string');
    // 重複を弾く前に登録されたデータもあるので、重複を除く
    return [...new Set(values)];
  } catch {
    return undefined;
  }
};

/**
 * 統合前のストアのデータを、新しいキーへ移す。
 *
 * 新しいキーにまだ何もなければ、旧キーから文字列だけを取り出して（重複は除く）
 * 新しい形式で書き込み、旧キーを消す。旧キーがない・読めないときは、その項目に `defaults` を使う。
 * persist の `migrate` は同じキーの中でしか使えないため、ストアを作る前に呼ぶ。
 *
 * @param storage 読み書きするストレージ（本番は localStorage、テストではメモリ上のもの）
 * @param target 移行先のキーと、保存形式のバージョン
 * @param defaults 旧データがない・読めない項目に使う値
 */
export const migrateLegacyStorage = (
  storage: KeyValueStorage,
  { name, version }: { name: string; version: number },
  defaults: CountRule,
) => {
  if (storage.getItem(name) !== null) return;

  const migrated: Partial<CountRule> = {};
  for (const legacy of LEGACY_STORES) {
    const values = readLegacyList(storage, legacy);
    if (values !== undefined) migrated[legacy.list] = values;
  }
  if (Object.keys(migrated).length === 0) return;

  storage.setItem(
    name,
    JSON.stringify({ state: { ...defaults, ...migrated }, version }),
  );
  for (const { key } of LEGACY_STORES) storage.removeItem(key);
};
