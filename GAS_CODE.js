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
 * 2. フォルダを開いてURLからフォルダIDをコピー
 *    （例: https://drive.google.com/drive/folders/XXXXX の XXXXX 部分）
 * 3. settingsシートに image_folder_id キーでフォルダIDを設定
 * 4. そのフォルダに画像をアップロード
 * 5. スプレッドシートのthumbnail列にファイル名を入力（例: my-image.jpg）
 */

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
    throw new Error('image_folder_id or image_folder_url is not set in settings sheet. Please add a row with key "image_folder_id" and the Google Drive folder ID as value.');
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
  const folderId = getSetting('image_folder_id');
  const folderUrl = getSetting('image_folder_url');
  console.log('image_folder_id:', folderId);
  console.log('image_folder_url:', folderUrl);
}
