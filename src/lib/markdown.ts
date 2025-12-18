/**
 * シンプルなMarkdownパーサー
 * 基本的なMarkdown記法をHTMLに変換します
 */

export function parseMarkdown(markdown: string): string {
  let html = markdown;
  
  // コードブロック（先に処理して他の変換の影響を受けないようにする）
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = escapeHtml(code.trim());
    return `<pre><code class="language-${lang || 'text'}">${escapedCode}</code></pre>`;
  });
  
  // インラインコード
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 見出し
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // 太字
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // リンク
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  // 連続する引用をまとめる
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');
  
  // 順序なしリスト
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // 順序付きリスト
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // 段落
  // 空行で区切られたテキストを段落として扱う
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    // すでにHTMLタグで始まっている場合はそのまま
    if (block.match(/^<(h[1-6]|ul|ol|li|pre|blockquote|p)/)) {
      return block;
    }
    // 空のブロックはスキップ
    if (!block.trim()) {
      return '';
    }
    // それ以外は段落として扱う
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n\n');
  
  return html;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => escapeMap[char]);
}
