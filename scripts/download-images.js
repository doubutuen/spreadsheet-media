/**
 * ビルド時にGoogle Driveから画像をダウンロードするスクリプト
 * 
 * 以下の2つのソースから画像をダウンロードします：
 * 1. image_folder_url で指定されたフォルダ内の全画像（GAS API経由）
 * 2. articles の thumbnail 列に指定された Google Drive URL
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
 * Google DriveのURLからファイルIDを抽出
 */
function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  
  // 形式1: https://drive.google.com/file/d/FILE_ID/view?...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  
  // 形式2: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];
  
  // 形式3: https://drive.google.com/uc?export=download&id=FILE_ID
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  
  return null;
}

/**
 * URLがGoogle DriveのURLかどうかを判定
 */
function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Google Driveから画像をダウンロード
 * リダイレクトを追跡して実際のファイルを取得
 */
async function downloadFromGoogleDrive(fileId, maxRetries = 3) {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}: Downloading...`);
      
      const response = await fetch(downloadUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      
      // HTMLの場合（ウイルススキャン警告など）
      if (contentType.includes('text/html')) {
        const html = await response.text();
        
        // 確認リンクを抽出
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
        
        throw new Error('Could not bypass Google Drive download confirmation');
      }
      
      return await response.arrayBuffer();
      
    } catch (error) {
      console.log(`  Attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * ファイル拡張子を推測
 */
function guessExtension(mimeType, filename) {
  if (filename && filename.includes('.')) {
    return filename.split('.').pop().toLowerCase();
  }
  
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico'
  };
  
  return mimeToExt[mimeType] || 'png';
}

async function downloadImages() {
  const gasApiUrl = process.env.GAS_API_URL;
  
  if (!gasApiUrl) {
    console.log('GAS_API_URL not set, skipping image download');
    return;
  }
  
  console.log('========================================');
  console.log('Starting image download process...');
  console.log('========================================\n');
  
  // 出力ディレクトリを作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const downloadedFiles = new Set(); // 重複ダウンロード防止
  let successCount = 0;
  let failCount = 0;
  
  try {
    // ========================================
    // 1. GAS APIから全データを取得
    // ========================================
    console.log('Fetching data from GAS API...');
    const separator = gasApiUrl.includes('?') ? '&' : '?';
    
    const allDataUrl = `${gasApiUrl}${separator}action=all`;
    const allDataResponse = await fetch(allDataUrl);
    const allData = await allDataResponse.json();
    
    if (allData.error) {
      console.error('Error fetching data:', allData.error);
      return;
    }
    
    // ========================================
    // 2. image_folder内の画像をダウンロード
    // ========================================
    console.log('\n--- Downloading from image folder ---');
    const imagesUrl = `${gasApiUrl}${separator}action=images`;
    const imagesResponse = await fetch(imagesUrl);
    const imagesData = await imagesResponse.json();
    
    const folderImages = imagesData.images || [];
    console.log(`Found ${folderImages.length} images in folder`);
    
    for (const image of folderImages) {
      if (!image.downloadUrl || !image.filename) continue;
      if (downloadedFiles.has(image.filename)) continue;
      
      console.log(`\nDownloading: ${image.filename}`);
      
      try {
        const arrayBuffer = await downloadFromGoogleDrive(image.fileId);
        const buffer = Buffer.from(arrayBuffer);
        const outputPath = path.join(OUTPUT_DIR, image.filename);
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`  Saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        downloadedFiles.add(image.filename);
        successCount++;
      } catch (error) {
        console.error(`  Error: ${error.message}`);
        failCount++;
      }
    }
    
    // ========================================
    // 3. articles の thumbnail 列からGoogle Drive URLを抽出してダウンロード
    // ========================================
    console.log('\n--- Downloading from article thumbnails ---');
    const articles = allData.articles || [];
    
    for (const article of articles) {
      const thumbnail = article.thumbnail;
      
      if (!thumbnail || !isGoogleDriveUrl(thumbnail)) continue;
      
      const fileId = extractGoogleDriveFileId(thumbnail);
      if (!fileId) {
        console.log(`\nSkipping invalid URL: ${thumbnail}`);
        continue;
      }
      
      // ファイル名を生成（fileIdベース）
      const filename = `gdrive_${fileId}.png`;
      
      if (downloadedFiles.has(filename)) {
        console.log(`\nSkipping (already downloaded): ${filename}`);
        continue;
      }
      
      console.log(`\nDownloading thumbnail for article "${article.title || article.slug}":`);
      console.log(`  URL: ${thumbnail}`);
      console.log(`  File ID: ${fileId}`);
      
      try {
        const arrayBuffer = await downloadFromGoogleDrive(fileId);
        const buffer = Buffer.from(arrayBuffer);
        const outputPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`  Saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        downloadedFiles.add(filename);
        successCount++;
      } catch (error) {
        console.error(`  Error: ${error.message}`);
        failCount++;
      }
    }
    
    // ========================================
    // 4. authors の avatar 列からGoogle Drive URLを抽出してダウンロード
    // ========================================
    console.log('\n--- Downloading from author avatars ---');
    const authors = allData.authors || [];
    
    for (const author of authors) {
      const avatar = author.avatar;
      
      if (!avatar || !isGoogleDriveUrl(avatar)) continue;
      
      const fileId = extractGoogleDriveFileId(avatar);
      if (!fileId) continue;
      
      const filename = `gdrive_${fileId}.png`;
      
      if (downloadedFiles.has(filename)) continue;
      
      console.log(`\nDownloading avatar for author "${author.name}":`);
      
      try {
        const arrayBuffer = await downloadFromGoogleDrive(fileId);
        const buffer = Buffer.from(arrayBuffer);
        const outputPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`  Saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        downloadedFiles.add(filename);
        successCount++;
      } catch (error) {
        console.error(`  Error: ${error.message}`);
        failCount++;
      }
    }
    
  } catch (error) {
    console.error('Error in download process:', error);
  }
  
  console.log(`\n========================================`);
  console.log(`Image download complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Total files: ${downloadedFiles.size}`);
  console.log(`========================================\n`);
}

downloadImages();
