/**
 * SpreadMedia - Google Apps Script API
 * 
 * このスクリプトをスプレッドシートに追加して、ウェブアプリとしてデプロイすると
 * SpreadMediaからデータを取得できるようになります。
 * 
 * セットアップ手順:
 * 1. スプレッドシートを開く
 * 2. 「拡張機能」→「Apps Script」を選択
 * 3. このコードを貼り付けて保存
 * 4. 「デプロイ」→「新しいデプロイ」
 * 5. 種類: 「ウェブアプリ」を選択
 * 6. 実行するユーザー: 「自分」
 * 7. アクセスできるユーザー: 「全員」
 * 8. デプロイしてURLをコピー
 * 
 * 画像機能を使う場合:
 * 1. Google Driveに画像用フォルダを作成
 * 2. settingsシートに image_folder_url キーでフォルダURLを設定
 *    （例: https://drive.google.com/drive/folders/XXXXX）
 * 3. そのフォルダに画像をアップロード
 * 4. スプレッドシートのthumbnail列にファイル名を入力（例: my-image.jpg）
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
      // 全シートのデータを取得
      data = getAllData();
    } else if (action === 'images') {
      // 画像一覧を取得
      data = getImageList();
    } else if (action === 'image') {
      // 特定の画像をBase64で取得
      const filename = e.parameter.filename;
      if (!filename) {
        throw new Error('filename parameter is required');
      }
      data = getImageBase64(filename);
    } else if (sheet) {
      // 特定のシートのデータを取得
      data = getSheetData(sheet);
    } else {
      // シート一覧を取得
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
  
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      // 日付オブジェクトをISO文字列に変換
      if (value instanceof Date) {
        value = value.toISOString();
      }
      
      // 空文字列はnullに変換
      if (value === '') {
        value = null;
      }
      
      obj[header] = value;
    });
    return obj;
  }).filter(row => {
    // 完全に空の行を除外（idがnullまたは空の行）
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
 * settingsシートの image_folder_id または image_folder_url から取得
 */
function getImageFolder() {
  // まずフォルダIDを確認
  let folderId = getSetting('image_folder_id');
  
  // フォルダIDがない場合はURLから抽出を試みる
  if (!folderId) {
    const folderUrl = getSetting('image_folder_url');
    if (folderUrl) {
      // URLからフォルダIDを抽出
      // 形式: https://drive.google.com/drive/folders/FOLDER_ID
      const match = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (match) {
        folderId = match[1];
      }
    }
  }
  
  if (!folderId) {
    throw new Error('image_folder_id or image_folder_url is not set in settings sheet. Please add a row with key "image_folder_url" and the Google Drive folder URL as value.');
  }
  
  try {
    return DriveApp.getFolderById(folderId);
  } catch (e) {
    throw new Error(`Cannot access folder with ID "${folderId}". Make sure the folder exists and you have access to it.`);
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
      
      // 画像ファイルのみを対象
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
    throw new Error(`Image "${filename}" not found in the image folder`);
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

/**
 * 全画像をBase64で取得（ビルド時に一括取得用）
 */
function getAllImagesBase64() {
  const folder = getImageFolder();
  const files = folder.getFiles();
  const images = [];
  
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    
    // 画像ファイルのみを対象
    if (mimeType.startsWith('image/')) {
      const blob = file.getBlob();
      const base64 = Utilities.base64Encode(blob.getBytes());
      
      images.push({
        filename: file.getName(),
        mimeType: mimeType,
        base64: base64
      });
    }
  }
  
  return { images: images };
}

// ============================================================
// テスト用関数
// ============================================================

/**
 * テスト用関数 - スクリプトエディタから実行して動作確認
 */
function testGetAllData() {
  const data = getAllData();
  console.log(JSON.stringify(data, null, 2));
}

/**
 * テスト用関数 - 特定のシートのデータを確認
 */
function testGetArticles() {
  const data = getSheetData('articles');
  console.log(JSON.stringify(data, null, 2));
}

/**
 * テスト用関数 - 画像一覧を確認
 */
function testGetImageList() {
  const data = getImageList();
  console.log(JSON.stringify(data, null, 2));
}

/**
 * テスト用関数 - 設定値を確認
 */
function testGetSettings() {
  const settings = ['site_title', 'site_url', 'theme', 'deploy_hook_url', 'image_folder_url'];
  settings.forEach(key => {
    console.log(`${key}: ${getSetting(key)}`);
  });
}
