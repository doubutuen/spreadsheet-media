import type { Article, Category, Tag, Author, SpreadsheetData, Interviewee } from '../types';

/**
 * Google スプレッドシートからデータを取得するクラス
 * 
 * 本番環境では Google Sheets API を使用しますが、
 * デモ・開発環境ではローカルのJSONデータを使用します。
 * 
 * Google Sheets API を使用する場合の設定:
 * 1. Google Cloud Console でプロジェクトを作成
 * 2. Google Sheets API を有効化
 * 3. サービスアカウントを作成し、JSONキーをダウンロード
 * 4. スプレッドシートをサービスアカウントに共有
 * 5. 環境変数に GOOGLE_SHEETS_ID と GOOGLE_SERVICE_ACCOUNT_KEY を設定
 */

// スプレッドシートの公開URLからCSVを取得する関数
async function fetchPublicSheetAsCSV(sheetId: string, gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.statusText}`);
  }
  return response.text();
}

// CSVをパースする関数
function parseCSV(csv: string): string[][] {
  const lines = csv.split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }).filter(row => row.some(cell => cell !== ''));
}

// ローカルのサンプルデータを読み込む
import articlesData from '../data/articles.json';
import categoriesData from '../data/categories.json';
import tagsData from '../data/tags.json';
import authorsData from '../data/authors.json';
import settingsData from '../data/settings.json';

/**
 * スプレッドシートから全データを取得
 * 環境変数が設定されていない場合はローカルのサンプルデータを使用
 */
export async function getSpreadsheetData(): Promise<SpreadsheetData> {
  const sheetId = import.meta.env.GOOGLE_SHEETS_ID;
  
  // 環境変数が設定されていない場合はローカルデータを使用
  if (!sheetId) {
    return getLocalData();
  }
  
  // Google スプレッドシートからデータを取得
  // 各シートのgidは実際のスプレッドシートに合わせて設定してください
  try {
    // 実際のGoogle Sheets API連携はここに実装
    // 現在はローカルデータにフォールバック
    return getLocalData();
  } catch (error) {
    console.error('Failed to fetch from Google Sheets, using local data:', error);
    return getLocalData();
  }
}

/**
 * インタビュー対象者のJSONをパース
 */
function parseInterviewees(intervieweesStr: string | undefined): Interviewee[] | undefined {
  if (!intervieweesStr) return undefined;
  try {
    return JSON.parse(intervieweesStr);
  } catch {
    return undefined;
  }
}

/**
 * 画像配列のJSONをパース
 */
function parseImages(imagesStr: string | undefined): string[] | undefined {
  if (!imagesStr) return undefined;
  try {
    return JSON.parse(imagesStr);
  } catch {
    // カンマ区切りの場合
    return imagesStr.split(',').map(s => s.trim()).filter(s => s);
  }
}

/**
 * ローカルのJSONデータを読み込む
 */
function getLocalData(): SpreadsheetData {
  const articles: Article[] = (articlesData as any[]).map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    content: a.content,
    categoryId: a.category_id,
    authorId: a.author_id,
    tags: a.tags ? a.tags.split(',').map((t: string) => parseInt(t.trim())) : [],
    status: a.status,
    publishedAt: a.published_at,
    relatedArticleIds: a.related_article_ids ? a.related_article_ids.split(',').map((id: string) => parseInt(id.trim())) : [],
    metaDescription: a.meta_description,
    // 新規フィールド
    thumbnail: a.thumbnail || undefined,
    images: parseImages(a.images),
    articleType: a.article_type || 'standard',
    interviewees: parseInterviewees(a.interviewees)
  }));

  const categories: Category[] = (categoriesData as any[]).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug
  }));

  const tags: Tag[] = (tagsData as any[]).map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug
  }));

  const authors: Author[] = (authorsData as any[]).map(a => ({
    id: a.id,
    name: a.name,
    profile: a.profile,
    avatar: a.avatar || undefined
  }));

  const settings = new Map<string, string>();
  (settingsData as any[]).forEach(s => {
    settings.set(s.key, s.value);
  });

  return { articles, categories, tags, authors, settings };
}

/**
 * 公開済みの記事のみを取得
 */
export async function getPublishedArticles(): Promise<Article[]> {
  const data = await getSpreadsheetData();
  return data.articles
    .filter(article => article.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/**
 * スラッグから記事を取得
 */
export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const data = await getSpreadsheetData();
  return data.articles.find(article => article.slug === slug && article.status === 'published');
}

/**
 * カテゴリIDから記事を取得
 */
export async function getArticlesByCategory(categoryId: number): Promise<Article[]> {
  const data = await getSpreadsheetData();
  return data.articles
    .filter(article => article.categoryId === categoryId && article.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/**
 * タグIDから記事を取得
 */
export async function getArticlesByTag(tagId: number): Promise<Article[]> {
  const data = await getSpreadsheetData();
  return data.articles
    .filter(article => article.tags.includes(tagId) && article.status === 'published')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/**
 * 関連記事を取得
 */
export async function getRelatedArticles(articleId: number): Promise<Article[]> {
  const data = await getSpreadsheetData();
  const article = data.articles.find(a => a.id === articleId);
  if (!article) return [];
  
  return data.articles.filter(a => 
    article.relatedArticleIds.includes(a.id) && a.status === 'published'
  );
}

/**
 * カテゴリを取得
 */
export async function getCategories(): Promise<Category[]> {
  const data = await getSpreadsheetData();
  return data.categories;
}

/**
 * IDからカテゴリを取得
 */
export async function getCategoryById(id: number): Promise<Category | undefined> {
  const data = await getSpreadsheetData();
  return data.categories.find(c => c.id === id);
}

/**
 * スラッグからカテゴリを取得
 */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const data = await getSpreadsheetData();
  return data.categories.find(c => c.slug === slug);
}

/**
 * タグを取得
 */
export async function getTags(): Promise<Tag[]> {
  const data = await getSpreadsheetData();
  return data.tags;
}

/**
 * IDからタグを取得
 */
export async function getTagById(id: number): Promise<Tag | undefined> {
  const data = await getSpreadsheetData();
  return data.tags.find(t => t.id === id);
}

/**
 * スラッグからタグを取得
 */
export async function getTagBySlug(slug: string): Promise<Tag | undefined> {
  const data = await getSpreadsheetData();
  return data.tags.find(t => t.slug === slug);
}

/**
 * 著者を取得
 */
export async function getAuthors(): Promise<Author[]> {
  const data = await getSpreadsheetData();
  return data.authors;
}

/**
 * IDから著者を取得
 */
export async function getAuthorById(id: number): Promise<Author | undefined> {
  const data = await getSpreadsheetData();
  return data.authors.find(a => a.id === id);
}

/**
 * サイト設定を取得
 */
export async function getSiteSettings(): Promise<Map<string, string>> {
  const data = await getSpreadsheetData();
  return data.settings;
}

/**
 * 特定の設定値を取得
 */
export async function getSetting(key: string): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings.get(key);
}
