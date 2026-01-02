# SpreadMedia

Googleスプレッドシートをデータソースとして使用する高速メディアサイト構築システムです。

## 特徴

| 機能 | 説明 |
|------|------|
| スプレッドシートでCMS | 使い慣れたGoogleスプレッドシートで記事を管理 |
| 爆速パフォーマンス | Astroによる静的サイト生成 |
| SEO最適化 | 構造化データ、サイトマップ、メタタグを自動生成 |
| 画像管理 | Google Driveから自動取得してCDN配信 |
| マガジンテーマ | 洗練されたマガジン風デザイン |
| インタビュー記事 | 対話形式の記事を吹き出しUIで表示 |
| ワンクリックデプロイ | スプレッドシートから直接サイト更新 |

## 技術スタック

- **フロントエンド**: Astro + Tailwind CSS
- **データソース**: Google スプレッドシート + GAS API
- **ホスティング**: Cloudflare Pages
- **画像管理**: Google Drive

---

## クイックスタート

### 必要なもの

- Googleアカウント
- Cloudflareアカウント

### ステップ1: スプレッドシートを作成

[テンプレートスプレッドシート](https://drive.google.com/open?id=1pZvOmczmmEwDadjyY8znazhbjmJWqakZ)をダウンロードして、Googleスプレッドシートとして開きます。

または、新規スプレッドシートを作成して以下の5つのシートを作成:

#### articlesシート

| カラム | 説明 | 例 |
|--------|------|-----|
| id | 一意なID（数値） | 1 |
| title | 記事タイトル | Astroで作る爆速メディア |
| slug | URL用スラッグ | astro-fast-media |
| content | 本文（Markdown） | ## はじめに... |
| category_id | カテゴリID | 1 |
| author_id | 著者ID | 1 |
| tags | タグID（カンマ区切り） | 1,2,3 |
| status | 公開状態 | published / draft |
| published_at | 公開日時 | 2025-01-01 10:00:00 |
| related_article_ids | 関連記事ID | 2,3 |
| meta_description | SEO説明文 | この記事では... |
| thumbnail | サムネイル | image.jpg または URL |
| article_type | 記事タイプ | standard / interview |
| interviewees | 登場人物（JSON） | [{"id":"...", "name":"..."}] |

#### categoriesシート

| カラム | 説明 |
|--------|------|
| id | 一意なID |
| name | カテゴリ名 |
| slug | URL用スラッグ |

#### tagsシート

| カラム | 説明 |
|--------|------|
| id | 一意なID |
| name | タグ名 |
| slug | URL用スラッグ |

#### authorsシート

| カラム | 説明 |
|--------|------|
| id | 一意なID |
| name | 著者名 |
| profile | プロフィール |
| avatar | アバター画像URL |

#### settingsシート

| key | value | 説明 |
|-----|-------|------|
| site_title | サイト名 | サイトのタイトル |
| site_description | 説明文 | SEO用の説明文 |
| site_url | https://... | サイトのURL |
| og_image | /images/og.jpg | OGP画像のパス |
| twitter_handle | @example | Twitterアカウント |
| theme | magazine | テーマ（magazine / default） |
| logo_text | LOGO | ヘッダーロゴのテキスト |
| logo_subtext | サブテキスト | ロゴの下に表示するサブテキスト |
| page_title | ページタイトル | トップページのメインタイトル |
| header_subtitle | サブタイトル | ヘッダーのサブタイトル |
| image_folder_url | https://drive.google.com/... | 画像フォルダのURL |
| favicon | /favicon.svg | ファビコン（.svg, .ico, .png対応） |
| deploy_hook_url | https://api.cloudflare.com/... | CloudflareのDeploy Hook URL |

### ステップ2: GASをデプロイ

1. スプレッドシートで「拡張機能」→「Apps Script」を開く
2. 以下のコードを貼り付けて保存:

<details>
<summary>GAS_CODE.js（クリックで展開）</summary>

```javascript
/**
 * SpreadMedia - Google Apps Script API
 * 
 * このスクリプトをスプレッドシートに追加して、ウェブアプリとしてデプロイすると
 * SpreadMediaからデータを取得できるようになります。
 * 
 * デプロイ機能を使う場合:
 * 1. Cloudflare PagesでDeploy Hookを作成
 *    - Settings → Builds & deployments → Deploy hooks → Add deploy hook
 * 2. settingsシートに deploy_hook_url キーでDeploy Hook URLを設定
 * 3. settingsシートに site_url キーでサイトURLを設定（任意）
 * 4. スプレッドシートを開くと「🚀 サイト管理」メニューが表示される
 */

// ============================================================
// メニュー・UI関連
// ============================================================

/**
 * スプレッドシートを開いた時にカスタムメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 サイト管理')
    .addItem('📤 デプロイを実行', 'triggerDeploy')
    .addSeparator()
    .addItem('🔍 設定を確認', 'showSettings')
    .addToUi();
}

/**
 * Cloudflare Pagesにデプロイをトリガーする
 */
function triggerDeploy() {
  const deployHookUrl = getSetting('deploy_hook_url');
  const siteUrl = getSetting('site_url') || 'サイト';
  
  if (!deployHookUrl) {
    SpreadsheetApp.getUi().alert(
      '⚠️ 設定が必要です',
      'settingsシートに deploy_hook_url が設定されていません。\n\n' +
      'Cloudflare PagesでDeploy Hookを作成し、URLを設定してください。\n\n' +
      '設定方法:\n' +
      '1. Cloudflare Dashboard → Pages → プロジェクト\n' +
      '2. Settings → Builds & deployments → Deploy hooks\n' +
      '3. Add deploy hook → URLをコピー\n' +
      '4. settingsシートに deploy_hook_url として追加',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  try {
    const response = UrlFetchApp.fetch(deployHookUrl, {
      method: 'POST',
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (statusCode === 200) {
      SpreadsheetApp.getUi().alert(
        '✅ デプロイ開始',
        'Cloudflare Pagesへのデプロイを開始しました。\n\n' +
        '完了まで2〜3分かかります。\n\n' +
        'サイト: ' + siteUrl,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        '❌ デプロイ失敗',
        'デプロイのトリガーに失敗しました。\n\n' +
        'ステータスコード: ' + statusCode + '\n' +
        'レスポンス: ' + responseText,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '❌ エラー',
      'エラーが発生しました: ' + error.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

/**
 * 現在の設定を表示
 */
function showSettings() {
  const settings = [
    'site_title',
    'site_url',
    'theme',
    'deploy_hook_url',
    'image_folder_url'
  ];
  
  let message = '現在の設定:\n\n';
  
  settings.forEach(key => {
    const value = getSetting(key);
    const displayValue = value ? (key.includes('hook') ? '設定済み ✓' : value) : '未設定';
    message += `${key}: ${displayValue}\n`;
  });
  
  SpreadsheetApp.getUi().alert('⚙️ 設定確認', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ============================================================
// API関連（GETリクエスト処理）
// ============================================================

/**
 * GETリクエストを処理するメイン関数
 */
function doGet(e) {
  try {
    const sheet = e.parameter.sheet;
    const action = e.parameter.action || 'all';
    
    let data;
    
    if (action === 'all') {
      data = getAllData();
    } else if (action === 'images') {
      data = getImageList();
    } else if (action === 'image') {
      const filename = e.parameter.filename;
      if (!filename) {
        throw new Error('filename parameter is required');
      }
      data = getImageBase64(filename);
    } else if (sheet) {
      data = getSheetData(sheet);
    } else {
      data = getSheetList();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 全シートのデータを取得
 */
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const result = {};
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    result[sheetName] = sheetToJson(sheet);
  });
  
  return result;
}

/**
 * 特定のシートのデータを取得
 */
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  
  return sheetToJson(sheet);
}

/**
 * シート一覧を取得
 */
function getSheetList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  return sheets.map(sheet => sheet.getName());
}

/**
 * シートのデータをJSON形式に変換
 */
function sheetToJson(sheet) {
  const data = sheet.getDataRange().getValues();
  const sheetName = sheet.getName();
  
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      if (value instanceof Date) {
        value = value.toISOString();
      }
      if (value === '') {
        value = null;
      }
      obj[header] = value;
    });
    return obj;
  }).filter(row => {
    // settingsシートは key でフィルタリング
    if (sheetName === 'settings') {
      return row.key !== null && row.key !== undefined && row.key !== '';
    }
    return row.id !== null && row.id !== undefined && row.id !== '';
  });
}

// ============================================================
// 設定関連
// ============================================================

/**
 * settingsシートから設定値を取得
 */
function getSetting(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('settings');
  
  if (!sheet) {
    return null;
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  
  return null;
}

// ============================================================
// 画像関連
// ============================================================

/**
 * 画像フォルダを取得
 */
function getImageFolder() {
  let folderId = getSetting('image_folder_id');
  
  if (!folderId) {
    const folderUrl = getSetting('image_folder_url');
    if (folderUrl) {
      const match = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (match) {
        folderId = match[1];
      }
    }
  }
  
  if (!folderId) {
    throw new Error('image_folder_id or image_folder_url is not set in settings sheet.');
  }
  
  try {
    return DriveApp.getFolderById(folderId);
  } catch (e) {
    throw new Error(`Cannot access folder with ID "${folderId}".`);
  }
}

/**
 * 画像一覧を取得
 */
function getImageList() {
  try {
    const folder = getImageFolder();
    const files = folder.getFiles();
    const images = [];
    
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      
      if (mimeType.startsWith('image/')) {
        images.push({
          filename: file.getName(),
          mimeType: mimeType,
          size: file.getSize(),
          lastUpdated: file.getLastUpdated().toISOString()
        });
      }
    }
    
    return { images: images };
  } catch (e) {
    return { error: e.message, images: [] };
  }
}

/**
 * 特定の画像をBase64で取得
 */
function getImageBase64(filename) {
  const folder = getImageFolder();
  const files = folder.getFilesByName(filename);
  
  if (!files.hasNext()) {
    throw new Error(`Image "${filename}" not found`);
  }
  
  const file = files.next();
  const blob = file.getBlob();
  const base64 = Utilities.base64Encode(blob.getBytes());
  
  return {
    filename: filename,
    mimeType: file.getMimeType(),
    base64: base64
  };
}
```

</details>

3. 「デプロイ」→「新しいデプロイ」
4. 設定:
   - 種類: **ウェブアプリ**
   - 実行するユーザー: **自分**
   - アクセスできるユーザー: **全員**
5. 「デプロイ」→ URLをコピー

### ステップ3: Cloudflare Pagesにデプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
2. 「Create a project」→「Connect to Git」
3. リポジトリ `doubutuen/spreadsheet-media` を選択
4. ビルド設定:

| 項目 | 値 |
|------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |

5. 環境変数:

| 変数名 | 値 |
|--------|-----|
| GAS_API_URL | GASのデプロイURL |

6. 「Save and Deploy」

### ステップ4: Deploy Hookを設定（ワンクリックデプロイ用）

1. Cloudflare Dashboard → Pages → プロジェクト → Settings
2. Builds & deployments → Deploy hooks → Add deploy hook
3. 名前を入力（例: `SpreadSheet Deploy`）→ Add
4. 生成されたURLをコピー
5. スプレッドシートのsettingsシートに `deploy_hook_url` として追加
6. スプレッドシートを再読み込みすると「🚀 サイト管理」メニューが表示される

---

## 画像管理

### Google Driveから画像を配信

1. Google Driveにフォルダを作成
2. settingsシートに `image_folder_url` を追加（フォルダのURLを貼り付け）
3. フォルダに画像をアップロード
4. articlesシートの `thumbnail` 列にファイル名を入力（例: `my-image.jpg`）
5. 再ビルドで画像がCloudflare CDNに配置される

### 外部URLを直接指定

`thumbnail` 列にURLを直接入力することも可能:
- `https://images.unsplash.com/photo-xxx`

---

## 記事タイプ

### 通常記事（standard）

Markdown形式で本文を記述:

```markdown
## はじめに

これは通常記事です。

- リスト1
- リスト2
```

### インタビュー記事（interview）

`article_type` を `interview` に設定し、対話形式で記述:

```
【interviewer】本日はよろしくお願いします。

【guest】こちらこそよろしくお願いします。
```

`interviewees` にJSON形式で登場人物を設定:

```json
[
  {"id": "interviewer", "name": "編集部", "role": "インタビュアー"},
  {"id": "guest", "name": "山田太郎", "role": "CEO"}
]
```

---

## テーマ

### magazine

洗練されたマガジン風デザイン。settingsシートで `theme` を `magazine` に設定。

### default

シンプルなブログ風デザイン。

---

## 更新方法

### 記事の追加・編集

**方法1: スプレッドシートから直接（推奨）**
1. スプレッドシートを編集
2. 「🚀 サイト管理」→「📤 デプロイを実行」をクリック

**方法2: Cloudflareから**
1. スプレッドシートを編集
2. Cloudflare Pagesで再デプロイ（Deployments → Retry deployment）

### GASコードの更新

1. Apps Scriptで新しいコードを保存
2. 「デプロイ」→「デプロイを管理」→「新しいデプロイ」
3. 新しいURLをCloudflare Pagesの環境変数に設定
4. 再デプロイ

---

## ローカル開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm preview
```

---

## リンク

- [テンプレートスプレッドシート](https://drive.google.com/open?id=1pZvOmczmmEwDadjyY8znazhbjmJWqakZ)
- [Cloudflare Pages](https://dash.cloudflare.com/)

## ライセンス

MIT License
