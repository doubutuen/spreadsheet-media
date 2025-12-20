import type { Article, Category, Tag, Author, SpreadsheetData, Interviewee } from '../types';

/**
 * Google スプレッドシートからデータを取得するクラス
 * 
 * GAS（Google Apps Script）をウェブアプリとしてデプロイし、
 * そのURLを環境変数 GAS_API_URL に設定することで連携します。
 * 
 * 環境変数が設定されていない場合は、ローカルのJSONデータを使用します。
 */

// ローカルのサンプルデータを読み込む
import articlesData from '../data/articles.json';
import categoriesData from '../data/categories.json';
import tagsData from '../data/tags.json';
import authorsData from '../data/authors.json';
import settingsData from '../data/settings.json';

// GAS APIのレスポンス型
interface GASResponse {
  articles?: any[];
  categories?: any[];
  tags?: any[];
  authors?: any[];
  settings?: any[];
  error?: string;
}

/**
 * GAS APIからデータを取得
 */
async function fetchFromGAS(): Promise<GASResponse> {
  const gasApiUrl = import.meta.env.GAS_API_URL;
  
  if (!gasApiUrl) {
    throw new Error('GAS_API_URL is not set');
  }
  
  const url = `${gasApiUrl}?action=all`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from GAS: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`GAS API error: ${data.error}`);
  }
  
  return data;
}

/**
 * スプレッドシートから全データを取得
 * 環境変数が設定されていない場合はローカルのサンプルデータを使用
 */
export async function getSpreadsheetData(): Promise<SpreadsheetData> {
  const gasApiUrl = import.meta.env.GAS_API_URL;
  
  // 環境変数が設定されていない場合はローカルデータを使用
  if (!gasApiUrl) {
    console.log('GAS_API_URL not set, using local data');
    return getLocalData();
  }
  
  // GAS APIからデータを取得
  try {
    console.log('Fetching data from GAS API...');
    const gasData = await fetchFromGAS();
    return parseGASData(gasData);
  } catch (error) {
    console.error('Failed to fetch from GAS API, using local data:', error);
    return getLocalData();
  }
}

/**
 * GAS APIのレスポンスをSpreadsheetData形式に変換
 */
function parseGASData(gasData: GASResponse): SpreadsheetData {
  const articles: Article[] = (gasData.articles || []).map(a => ({
    id: Number(a.id),
    title: a.title || '',
    slug: a.slug || '',
    content: a.content || '',
    categoryId: Number(a.category_id),
    authorId: Number(a.author_id),
    tags: a.tags ? String(a.tags).split(',').map((t: string) => parseInt(t.trim())).filter(n => !isNaN(n)) : [],
    status: a.status || 'draft',
    publishedAt: a.published_at || '',
    relatedArticleIds: a.related_article_ids ? String(a.related_article_ids).split(',').map((id: string) => parseInt(id.trim())).filter(n => !isNaN(n)) : [],
    metaDescription: a.meta_description || '',
    thumbnail: a.thumbnail || undefined,
    images: parseImages(a.images),
    articleType: a.article_type || 'standard',
    interviewees: parseInterviewees(a.interviewees)
  }));

  const categories: Category[] = (gasData.categories || []).map(c => ({
    id: Number(c.id),
    name: c.name || '',
    slug: c.slug || ''
  }));

  const tags: Tag[] = (gasData.tags || []).map(t => ({
    id: Number(t.id),
    name: t.name || '',
    slug: t.slug || ''
  }));

  const authors: Author[] = (gasData.authors || []).map(a => ({
    id: Number(a.id),
    name: a.name || '',
    profile: a.profile || '',
    avatar: a.avatar || undefined
  }));

  const settings = new Map<string, string>();
  (gasData.settings || []).forEach(s => {
    if (s.key) {
      settings.set(s.key, s.value || '');
    }
  });

  return { articles, categories, tags, authors, settings };
}

/**
 * インタビュー対象者のJSONをパース
 */
function parseInterviewees(intervieweesStr: string | undefined | null): Interviewee[] | undefined {
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
function parseImages(imagesStr: string | undefined | null): string[] | undefined {
  if (!imagesStr) return undefined;
  try {
    return JSON.parse(imagesStr);
  } catch {
    // カンマ区切りの場合
    return String(imagesStr).split(',').map(s => s.trim()).filter(s => s);
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
