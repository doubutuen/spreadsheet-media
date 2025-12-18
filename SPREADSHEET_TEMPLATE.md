# Google スプレッドシート テンプレート

このドキュメントでは、SpreadMediaで使用するGoogle スプレッドシートの構造を説明します。

## スプレッドシートの作成方法

1. [Google スプレッドシート](https://sheets.google.com)にアクセス
2. 新しいスプレッドシートを作成
3. 以下の5つのシートを作成

---

## シート1: `articles`（記事）

| カラム名 | 説明 | 例 |
|---|---|---|
| id | 記事の一意なID（数値） | 1 |
| title | 記事のタイトル（60文字以内推奨） | Astroで作る爆速メディア |
| slug | URLに使用するスラッグ（英数字とハイフン） | astro-fast-media |
| content | 記事本文（Markdown形式） | ## はじめに\n本記事では... |
| category_id | カテゴリID（categoriesシートのidと対応） | 1 |
| author_id | 著者ID（authorsシートのidと対応） | 1 |
| tags | タグID（カンマ区切りで複数指定可） | 1,2,3 |
| status | 公開状態（published または draft） | published |
| published_at | 公開日時（YYYY-MM-DD HH:MM:SS形式） | 2025-12-18 10:00:00 |
| related_article_ids | 関連記事のID（カンマ区切り） | 2,3 |
| meta_description | SEO用の説明文（160文字以内推奨） | この記事では... |
| **thumbnail** | サムネイル画像のURL | https://example.com/image.jpg |
| **images** | 本文内で使用する画像（JSON形式） | [{"url":"...", "alt":"..."}] |
| **article_type** | 記事タイプ（standard または interview） | standard |
| **interviewees** | インタビュー対象者（JSON形式、interview時のみ） | [{"id":"yamada", "name":"山田", "role":"CTO"}] |

### 記事タイプについて

**standard（通常記事）**: Markdown形式で本文を記述します。

**interview（インタビュー記事）**: 対話形式で本文を記述します。

#### インタビュー記事の本文フォーマット

```
【話者ID】発言内容

【話者ID】発言内容
```

例:
```
【interviewer】本日はお時間をいただきありがとうございます。

【yamada】こちらこそ、よろしくお願いします。

【interviewer】御社の技術スタックについて教えてください。
```

#### interviewees（インタビュー対象者）のJSON形式

```json
[
  {
    "id": "interviewer",
    "name": "編集部",
    "role": "SpreadMedia編集部",
    "avatar": "https://example.com/avatar.jpg"
  },
  {
    "id": "yamada",
    "name": "山田 健一",
    "role": "株式会社テックスタート CTO",
    "avatar": "https://example.com/yamada.jpg"
  }
]
```

### images（本文内画像）のJSON形式

```json
[
  {
    "url": "https://example.com/image1.jpg",
    "alt": "画像の説明文",
    "caption": "キャプション（任意）"
  }
]
```

本文内で画像を使用する場合は、Markdown形式で記述します:

```markdown
![画像の説明](https://example.com/image1.jpg)
```

---

## シート2: `categories`（カテゴリ）

| カラム名 | 説明 | 例 |
|---|---|---|
| id | カテゴリの一意なID（数値） | 1 |
| name | カテゴリ名 | 技術解説 |
| slug | URLに使用するスラッグ | tech |

---

## シート3: `tags`（タグ）

| カラム名 | 説明 | 例 |
|---|---|---|
| id | タグの一意なID（数値） | 1 |
| name | タグ名 | Astro |
| slug | URLに使用するスラッグ | astro |

---

## シート4: `authors`（著者）

| カラム名 | 説明 | 例 |
|---|---|---|
| id | 著者の一意なID（数値） | 1 |
| name | 著者名 | 田中 太郎 |
| profile | プロフィール文 | フルスタックエンジニア。... |
| **avatar** | 著者のアバター画像URL | https://example.com/avatar.jpg |

---

## シート5: `settings`（サイト設定）

| カラム名 | 説明 | 例 |
|---|---|---|
| key | 設定項目名 | site_title |
| value | 設定値 | SpreadMedia |

### 推奨する設定項目

| key | 説明 |
|---|---|
| site_title | サイトのタイトル |
| site_description | サイトの説明文 |
| site_url | サイトのURL |
| og_image | OGP画像のパス |
| twitter_handle | Twitterアカウント |

---

## Google Sheets API との連携

本番環境でGoogle スプレッドシートと連携するには、以下の手順が必要です：

### 1. Google Cloud Console でプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成

### 2. Google Sheets API を有効化

1. 「APIとサービス」→「ライブラリ」
2. 「Google Sheets API」を検索して有効化

### 3. サービスアカウントを作成

1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「サービスアカウント」
3. サービスアカウントを作成し、JSONキーをダウンロード

### 4. スプレッドシートを共有

1. 作成したスプレッドシートを開く
2. 「共有」ボタンをクリック
3. サービスアカウントのメールアドレスを追加（閲覧者権限）

### 5. 環境変数を設定

```env
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## 注意事項

- **id**は必ず一意な数値を設定してください
- **slug**は英数字とハイフンのみを使用してください
- **content**はMarkdown形式で記述できます
- **status**が`draft`の記事は公開されません
- **related_article_ids**を設定すると、記事ページに関連記事が表示されます
- **thumbnail**を設定すると、記事一覧とOGP画像に使用されます
- **article_type**を`interview`にすると、インタビュー形式で表示されます
