# 開発の手引き

このリポジトリで開発するときの準備と、決まりごとをまとめています。アプリの機能と設計は [README.md](README.md) にあります。

## 準備

[mise](https://mise.jdx.dev/) で Node のバージョン（`mise.toml`）を、[pnpm](https://pnpm.io/) で依存を管理しています。pnpm の版は、`package.json` の `packageManager` に書いてあります。

```bash
mise install    # Node を入れる
pnpm install
```

E2E を初めて流す前に、マシンごとに1回、ブラウザを入れます。

```bash
pnpm exec playwright install chromium
```

## コマンド

```bash
pnpm dev          # 開発サーバーを起動
pnpm build        # 型チェックと本番ビルド
pnpm lint         # lint と format のチェック
pnpm format       # 自動修正
pnpm typecheck    # 型チェックのみ
pnpm test         # 単体テスト（Vitest）
pnpm test:watch   # 単体テストを、変更のたびに流す
pnpm test:e2e     # E2E（Playwright。開発サーバーをポート 5180 で立ち上げる）
```

## テストの方針

単体テストと E2E は、次のように役割を分けています。

- **単体テスト**: 細かい分岐を確かめる。カウントの仕様、登録できる値とエラーの理由・文言、保存データの読み込みなど
  - `.ts` のファイルごとに、テストのファイルを置く。書けない・書かないところは `it.todo` にし、理由をテストのファイルに書く（テスト用のコード `src/shared/test/` は除く）
  - React のフックと画面の部品（`.tsx`）は、描くための環境をまだ入れていないので、単体テストを書いていない
- **E2E**: 部品をつないだときにしか確かめられないことだけを確かめる。入力から文字数の表示まで、ストアと localStorage のつながり、エラーが画面に出ること、ダイアログの開閉、削除の取り消し、テーマの保存など
- E2E の本数は絞る。単体テストで確かめられることは、E2E に書かない

## CI とデプロイ

GitHub Actions（`.github/workflows/ci.yml`）で、PR と `main` への push のたびに、次を流します。

- lint / 型チェック / 単体テスト / ビルド
- E2E（Chromium）
- Firebase Hosting へのデプロイ。`main` は本番に、PR はプレビュー用の URL（7日で消える）に出す。リポジトリの Secrets に `FIREBASE_SERVICE_ACCOUNT` がないときは、飛ばす

フォークと Dependabot の PR では、Secrets を渡さないので、デプロイしません。

## 依存の更新

Dependabot（`.github/dependabot.yml`）が、npm と GitHub Actions の更新を、月に1回 PR にします。公開されてから 7 日たった版だけが対象です。

### PR をマージする前に

自動ではマージしません。マージは本番へのデプロイの直前の確認なので、次を見てから手でマージします。

1. CI が緑か
2. PR に付くプレビューの URL を開き、テキストを貼る・ルールを足して消す・テーマを変える、をひととおり触って、見た目が崩れていないか（E2E は見た目を確かめていない）
3. メジャーの更新なら、変更履歴で、壊れうる変更がないか

PR がたまってマージできなくなったら、パッチとマイナーだけを自動でマージするように切り替えます。セキュリティの修正が入った版をいつまでも入れないより、そのほうが安全なためです。メジャーは手でマージします。

### 手で上げるもの

次の3つは、`ci.yml` の中で版を固定していますが、Dependabot は上げません。上げるときは、公開から 7 日たった版にして、手で書き換えます。

| もの                 | 場所                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| OS（`ubuntu-24.04`） | 各ジョブの `runs-on`。GitHub が提供をやめる前に、予告が出る                            |
| mise                 | `jdx/mise-action` の `version`（`check` と `e2e` の2か所）。手元の mise と同じ版にする |
| firebase-tools       | `FirebaseExtended/action-hosting-deploy` の `firebaseToolsVersion`                     |

Node は `mise.toml` で固定しています。これも Dependabot は上げないので、手で書き換えます。
