// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // サイトのベースURL（本番環境に合わせて変更してください）
  site: 'https://spreadmedia.example.com',
  
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    },
    preview: {
      allowedHosts: true
    }
  },

  integrations: [
    react(),
    sitemap({
      // サイトマップの設定
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  
  // ビルド設定
  build: {
    // インライン化するスタイルの閾値
    inlineStylesheets: 'auto'
  },
  
  // 圧縮設定
  compressHTML: true
});
