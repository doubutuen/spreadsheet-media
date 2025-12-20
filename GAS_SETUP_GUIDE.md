# SpreadMedia - Google Apps Script セットアップガイド

## 概要

このガイドでは、Google スプレッドシートにGAS（Google Apps Script）を設定し、SpreadMediaと連携する方法を説明します。

## 前提条件

- Googleアカウント
- SpreadMedia_Template.xlsx をGoogle スプレッドシートで開いていること

## セットアップ手順

### Step 1: スプレッドシートを準備

1. Google Driveで `SpreadMedia_Template.xlsx` を開く
2. 「ファイル」→「Google スプレッドシートとして保存」を選択
3. 新しいスプレッドシートが作成される

### Step 2: Apps Scriptを開く

1. スプレッドシートのメニューから「拡張機能」→「Apps Script」を選択
2. 新しいタブでApps Scriptエディタが開く

### Step 3: GASコードを貼り付け

1. エディタに表示されている `function myFunction() { }` を全て削除
2. `GAS_CODE.js` の内容を全てコピーして貼り付け
3. 「Ctrl + S」または「ファイル」→「保存」で保存
4. プロジェクト名を「SpreadMedia API」などに変更（任意）

### Step 4: ウェブアプリとしてデプロイ

1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 「種類の選択」の歯車アイコンをクリック
4. 「ウェブアプリ」を選択
5. 以下の設定を行う：

   | 項目 | 設定値 |
   |---|---|
   | 説明 | SpreadMedia API（任意） |
   | 実行するユーザー | **自分** |
   | アクセスできるユーザー | **全員** |

6. 「デプロイ」をクリック
7. 初回は「アクセスを承認」が必要
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「SpreadMedia API（安全ではないページ）に移動」をクリック
   - 「許可」をクリック

8. **ウェブアプリのURLをコピー**（後で使用）

   例: `https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec`

### Step 5: 動作確認

ブラウザで以下のURLにアクセスして、JSONデータが表示されることを確認：

```
https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec?action=all
```

## Cloudflare Pagesへの設定

### 環境変数を設定

1. Cloudflare Pagesのダッシュボードを開く
2. プロジェクト「spreadsheet-media」を選択
3. 「設定」→「環境変数」
4. 以下の環境変数を追加：

   | 変数名 | 値 |
   |---|---|
   | `GAS_API_URL` | Step 4でコピーしたウェブアプリのURL |

5. 「保存」をクリック

### 再デプロイ

環境変数を設定したら、再デプロイが必要です：

1. 「デプロイ」タブを開く
2. 最新のデプロイの「...」メニューから「デプロイを再試行」

## API仕様

### エンドポイント

```
GET https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec
```

### パラメータ

| パラメータ | 説明 | 例 |
|---|---|---|
| `action=all` | 全シートのデータを取得 | `?action=all` |
| `sheet=articles` | 特定のシートのデータを取得 | `?sheet=articles` |
| （なし） | シート一覧を取得 | - |

### レスポンス例

```json
{
  "articles": [
    {
      "id": 1,
      "title": "記事タイトル",
      "slug": "article-slug",
      "content": "記事の本文...",
      ...
    }
  ],
  "categories": [...],
  "tags": [...],
  "authors": [...],
  "settings": [...]
}
```

## トラブルシューティング

### 「アクセスが拒否されました」エラー

- 「アクセスできるユーザー」が「全員」になっているか確認
- 再デプロイが必要な場合がある

### データが更新されない

- スプレッドシートを編集後、GASの再デプロイは不要
- Cloudflare Pagesの再ビルドが必要

### CORSエラー

- GASはCORSを自動的に処理するため、通常は発生しない
- ビルド時（サーバーサイド）でのみAPIを呼ぶため問題なし

## スプレッドシートの更新方法

1. スプレッドシートで記事を追加・編集
2. GitHubにプッシュ、またはCloudflare Pagesで手動デプロイ
3. サイトが自動的に更新される

## 注意事項

- スプレッドシートのシート名（articles, categories, tags, authors, settings）は変更しないでください
- 1行目のヘッダー名も変更しないでください
- 空行は自動的にスキップされます
