/**
 * 閲覧履歴管理スクリプト
 * localStorageを使用して閲覧した記事を記録し、おすすめ記事を生成する
 */

interface ArticleData {
  id: number;
  slug: string;
  title: string;
  categoryId: number;
  tags: number[];
  thumbnail?: string;
  viewedAt: number;
}

interface HistoryEntry {
  articleId: number;
  slug: string;
  categoryId: number;
  tags: number[];
  viewedAt: number;
}

const STORAGE_KEY = 'spreadmedia_reading_history';
const MAX_HISTORY_SIZE = 50;

/**
 * 閲覧履歴を取得
 */
export function getReadingHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * 閲覧履歴に記事を追加
 */
export function addToHistory(article: ArticleData): void {
  try {
    const history = getReadingHistory();
    
    // 既存のエントリを削除（同じ記事の重複を防ぐ）
    const filtered = history.filter(h => h.articleId !== article.id);
    
    // 新しいエントリを先頭に追加
    const newEntry: HistoryEntry = {
      articleId: article.id,
      slug: article.slug,
      categoryId: article.categoryId,
      tags: article.tags,
      viewedAt: Date.now()
    };
    
    filtered.unshift(newEntry);
    
    // 最大サイズを超えたら古いものを削除
    const trimmed = filtered.slice(0, MAX_HISTORY_SIZE);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorageが使えない場合は何もしない
  }
}

/**
 * 閲覧履歴に基づいておすすめ記事IDを取得
 * @param allArticles 全記事のリスト
 * @param limit 取得する記事数
 * @returns おすすめ記事のslugリスト
 */
export function getRecommendedArticleSlugs(
  allArticleSlugs: string[],
  limit: number = 3
): { slugs: string[]; isPersonalized: boolean } {
  const history = getReadingHistory();
  
  // 履歴がない場合は空を返す（人気記事をフォールバックとして使用）
  if (history.length === 0) {
    return { slugs: [], isPersonalized: false };
  }
  
  // 閲覧済み記事のslugセット
  const viewedSlugs = new Set(history.map(h => h.slug));
  
  // カテゴリとタグの出現回数をカウント
  const categoryCount = new Map<number, number>();
  const tagCount = new Map<number, number>();
  
  history.forEach(entry => {
    categoryCount.set(entry.categoryId, (categoryCount.get(entry.categoryId) || 0) + 1);
    entry.tags.forEach(tag => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });
  
  // 未読記事のみをフィルタリング
  const unreadSlugs = allArticleSlugs.filter(slug => !viewedSlugs.has(slug));
  
  if (unreadSlugs.length === 0) {
    return { slugs: [], isPersonalized: false };
  }
  
  // 未読記事をシャッフルして返す（実際のスコアリングはサーバーサイドでできないため）
  const shuffled = [...unreadSlugs].sort(() => Math.random() - 0.5);
  
  return { 
    slugs: shuffled.slice(0, limit), 
    isPersonalized: true 
  };
}

/**
 * 閲覧履歴をクリア
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorageが使えない場合は何もしない
  }
}
