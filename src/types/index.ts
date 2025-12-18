// 記事データの型定義
export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  categoryId: number;
  authorId: number;
  tags: number[];
  status: 'published' | 'draft';
  publishedAt: string;
  relatedArticleIds: number[];
  metaDescription: string;
  // 新規追加: 画像関連
  thumbnail?: string;        // サムネイル画像URL
  images?: string[];         // 本文内で使用する画像URL配列
  // 新規追加: 記事タイプ
  articleType?: 'standard' | 'interview';  // 記事の種類
  // 新規追加: インタビュー用データ
  interviewees?: Interviewee[];  // インタビュー対象者
}

// インタビュー対象者の型定義
export interface Interviewee {
  id: string;           // 発言者ID（例: "A", "B", "interviewer"）
  name: string;         // 表示名
  role?: string;        // 役職・肩書き
  avatar?: string;      // アバター画像URL
}

// インタビュー発言の型定義（Markdown内で使用）
export interface InterviewStatement {
  speakerId: string;    // 発言者ID
  content: string;      // 発言内容
}

// カテゴリデータの型定義
export interface Category {
  id: number;
  name: string;
  slug: string;
}

// タグデータの型定義
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// 著者データの型定義
export interface Author {
  id: number;
  name: string;
  profile: string;
  avatar?: string;      // 新規追加: 著者アバター画像
}

// サイト設定の型定義
export interface SiteSetting {
  key: string;
  value: string;
}

// スプレッドシートから取得した全データ
export interface SpreadsheetData {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  settings: Map<string, string>;
}
