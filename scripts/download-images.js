/**
 * ビルド時にGoogle Drive（GAS経由）から画像をダウンロードするスクリプト
 * 
 * GASから画像の公開URLを取得し、直接ダウンロードしてpublic/images/uploadsに保存します。
 * これにより、Cloudflare Pages上に画像が直接配置され、高速に配信されます。
 * 
 * 使用方法:
 * GAS_API_URL=your-gas-url node scripts/download-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'uploads');

/**
 * Google Driveから画像をダウンロード
 * リダイレクトを追跡して実際のファイルを取得
 */
async function downloadFromGoogleDrive(downloadUrl, filename, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}: Downloading from Google Drive...`);
      
      // Google Driveの直接ダウンロードURLにアクセス
      const response = await fetch(downloadUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // レスポンスがHTMLの場合（ウイルススキャン警告など）、確認URLを取得
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        const html = await response.text();
        
        // ウイルススキャン警告ページの場合、確認リンクを抽出
        const confirmMatch = html.match(/href="(\/uc\?export=download[^"]+)"/);
        if (confirmMatch) {
          const confirmUrl = 'https://drive.google.com' + confirmMatch[1].replace(/&amp;/g, '&');
          console.log(`  Large file detected, using confirm URL...`);
          
          const confirmResponse = await fetch(confirmUrl, {
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (!confirmResponse.ok) {
            throw new Error(`Confirm download failed: HTTP ${confirmResponse.status}`);
          }
          
          return await confirmResponse.arrayBuffer();
        }
        
        // 別の形式の確認リンクを試す
        const idMatch = downloadUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (idMatch) {
          const fileId = idMatch[1];
          const altUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
          console.log(`  Trying alternative download URL...`);
          
          const altResponse = await fetch(altUrl, {
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (altResponse.ok) {
            const altContentType = altResponse.headers.get('content-type') || '';
            if (!altContentType.includes('text/html')) {
              return await altResponse.arrayBuffer();
            }
          }
        }
        
        throw new Error('Could not bypass Google Drive download confirmation');
      }
      
      return await response.arrayBuffer();
      
    } catch (error) {
      console.log(`  Attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      // リトライ前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function downloadImages() {
  const gasApiUrl = process.env.GAS_API_URL;
  
  if (!gasApiUrl) {
    console.log('GAS_API_URL not set, skipping image download');
    return;
  }
  
  console.log('Fetching image list from GAS...');
  console.log('API URL:', gasApiUrl.substring(0, 50) + '...');
  
  try {
    // 画像一覧を取得（公開URLを含む）
    const separator = gasApiUrl.includes('?') ? '&' : '?';
    const listUrl = `${gasApiUrl}${separator}action=images`;
    
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();
    
    if (listData.error) {
      console.error('Error fetching image list:', listData.error);
      return;
    }
    
    const images = listData.images || [];
    console.log(`Found ${images.length} images`);
    
    if (images.length === 0) {
      console.log('No images to download');
      return;
    }
    
    // 出力ディレクトリを作成
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // 各画像をダウンロード
    let successCount = 0;
    let failCount = 0;
    
    for (const image of images) {
      console.log(`\nDownloading: ${image.filename} (${(image.size / 1024 / 1024).toFixed(2)} MB)`);
      
      try {
        if (!image.downloadUrl) {
          console.log(`  Skipped: No download URL available`);
          failCount++;
          continue;
        }
        
        // Google Driveから画像をダウンロード
        const arrayBuffer = await downloadFromGoogleDrive(image.downloadUrl, image.filename);
        
        // ファイルに保存
        const buffer = Buffer.from(arrayBuffer);
        const outputPath = path.join(OUTPUT_DIR, image.filename);
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`  Saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        successCount++;
        
      } catch (error) {
        console.error(`  Error downloading ${image.filename}:`, error.message);
        failCount++;
      }
    }
    
    console.log(`\n========================================`);
    console.log(`Image download complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log(`========================================\n`);
    
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadImages();
