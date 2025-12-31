/**
 * ビルド時にGoogle Drive（GAS経由）から画像をダウンロードするスクリプト
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

async function downloadImages() {
  const gasApiUrl = process.env.GAS_API_URL;
  
  if (!gasApiUrl) {
    console.log('GAS_API_URL not set, skipping image download');
    return;
  }
  
  console.log('Fetching image list from GAS...');
  
  try {
    // 画像一覧を取得
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
    for (const image of images) {
      console.log(`Downloading: ${image.filename}`);
      
      const imageUrl = `${gasApiUrl}${separator}action=image&filename=${encodeURIComponent(image.filename)}`;
      const imageResponse = await fetch(imageUrl);
      const imageData = await imageResponse.json();
      
      if (imageData.error) {
        console.error(`Error downloading ${image.filename}:`, imageData.error);
        continue;
      }
      
      // Base64をデコードしてファイルに保存
      const buffer = Buffer.from(imageData.base64, 'base64');
      const outputPath = path.join(OUTPUT_DIR, image.filename);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Saved: ${outputPath}`);
    }
    
    console.log('Image download complete!');
    
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadImages();
