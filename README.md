# 台詞カウンター

台本などの台詞テキストの文字数を、除外ルールを設定したうえでリアルタイムに数える Web アプリです。

## 機能

- 空白・改行をカウントするかを切り替えられる
- カウントしない文字（`、` `。` `「` `」` など）を登録できる
- 指定した文字で始まる行（`//` で始まるコメント行など）をカウントから除外できる
- 設定はブラウザ（localStorage）に保存される

## 技術スタック

- React 19 / TypeScript / Vite
- Tailwind CSS v4 / Headless UI
- zustand（状態管理）
- react-hook-form / Zod（フォームとバリデーション）
- Biome（lint / format）

## 開発

[pnpm](https://pnpm.io/) を使います。

```bash
pnpm install
pnpm dev        # 開発サーバーを起動
pnpm build      # 型チェックと本番ビルド
pnpm lint       # lint と format のチェック
pnpm format     # 自動修正
pnpm typecheck  # 型チェックのみ
```
