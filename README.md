# SpreadMedia - Googleスプレッドシート連動型ウェブメディア

Googleスプレッドシートをヘッドレスなスプレッドシートとして活用し、高速かつSEOに強いウェブメディアを構築するためのAstroプロジェクトです。

## 特徴

| 機能 | 説明 |
|---|---|
| **スプレッドシートでCMS** | 使い慣れたGoogleスプレッドシートで記事を管理 |
| **爆速パフォーマンス** | Astroによる静的サイト生成でCore Web Vitalsの基準をクリア |
| **SEO最適化** | 構造化データ、サイトマップ、メタタグを自動生成 |
| **記事間の内部リンク** | 関連記事を簡単に設定可能 |
| **サムネイル画像** | 記事一覧とOGPに表示されるサムネイル |
| **インタビュー記事** | 対話形式の記事を吹き出しUIで表示 |
| **本文内画像** | Markdownで記事内に画像を挿入可能 |

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| 静的サイトジェネレーター | Astro |
| スタイリング | Tailwind CSS |
| データソース | Google Sheets API / ローカルJSON |
| ホスティング | **Cloudflare Pages**（推奨） |

## プロジェクト構造

```
spreadsheet-media/
├── src/
│   ├── components/       # 再利用可能なコンポーネント
│   │   ├── ArticleCard.astro      # 記事カード（サムネイル対応）
│   │   ├── RelatedArticles.astro  # 関連記事
│   │   ├── TagList.astro          # タグリスト
│   │   ├── InterviewBlock.astro   # インタビュー発言ブロック
│   │   └── InterviewArticle.astro # インタビュー記事全体
│   ├── data/             # サンプルデータ（JSON形式）
│   ├── layouts/          # ページレイアウト
│   ├── lib/              # ユーティリティ関数
│   ├── pages/            # ページコンポーネント
│   ├── styles/           # グローバルスタイル
│   └── types/            # TypeScript型定義
├── public/               # 静的ファイル
├── astro.config.mjs      # Astro設定
└── SPREADSHEET_TEMPLATE.md  # スプレッドシートのテンプレート説明
```

## ローカル開発

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```

### 3. 本番ビルド

```bash
pnpm build
```

### 4. プレビュー

```bash
pnpm preview
```

## Cloudflare Pagesへのデプロイ

### 方法1: GitHubと連携（推奨）

1. **GitHubにリポジトリをプッシュ**

2. **Cloudflareダッシュボードでプロジェクトを作成**
   - https://dash.cloudflare.com にアクセス
   - 「Pages」→「Create a project」→「Connect to Git」
   - GitHubアカウントを連携し、リポジトリを選択

3. **ビルド設定**

   | 項目 | 設定値 |
   |---|---|
   | Framework preset | Astro |
   | Build command | `pnpm build` |
   | Build output directory | `dist` |

4. **環境変数を設定**

   | 変数名 | 値 |
   |---|---|
   | `NODE_VERSION` | `18` |
   | `GOOGLE_SHEETS_ID` | スプレッドシートのID |
   | `GOOGLE_SERVICE_ACCOUNT_KEY` | サービスアカウントのJSONキー |

5. **デプロイ**
   - 「Save and Deploy」をクリック

### 方法2: Wrangler CLIで直接デプロイ

```bash
# Wranglerをインストール
pnpm add -g wrangler

# Cloudflareにログイン
wrangler login

# ビルド
pnpm build

# デプロイ
wrangler pages deploy dist --project-name=spreadmedia
```

## 記事タイプ

SpreadMediaは2種類の記事タイプをサポートしています。

### 通常記事（standard）

Markdown形式で本文を記述する標準的な記事形式です。

### インタビュー記事（interview）

対話形式で本文を記述し、吹き出しUIで表示される記事形式です。

```
【interviewer】本日はお時間をいただきありがとうございます。

【yamada】こちらこそ、よろしくお願いします。
```

## Google スプレッドシートとの連携

詳細は `SPREADSHEET_TEMPLATE.md` を参照してください。

## スプレッドシートの構造

| シート名 | 説明 |
|---|---|
| **articles** | 記事データ（タイトル、本文、サムネイル、記事タイプなど） |
| **categories** | カテゴリデータ |
| **tags** | タグデータ |
| **authors** | 著者データ（アバター画像対応） |
| **settings** | サイト設定 |

## ライセンス

MIT License
