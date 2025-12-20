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
