import { parseMarkdown } from './markdown';

interface ParsedBlock {
  type: 'markdown' | 'chat';
  content: string;  // HTMLとしてパース済み
  speakerId?: string;
}

/**
 * コンテンツをMarkdownブロックとチャットブロックに分割し、HTMLにパースする
 */
export function parseContentToBlocks(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = content.split('\n');
  
  let currentMarkdown: string[] = [];
  let currentChatSpeaker: string | null = null;
  let currentChatContent: string[] = [];
  
  // 両方の記法をサポート: 【speaker】内容 と [speaker:id] (次行に内容)
  const inlineChatPattern = /^【([^\]]+)】(.+)$/;
  const speakerOnlyPattern = /^\[speaker:([^\]]+)\]$/;
  
  const flushMarkdown = () => {
    if (currentMarkdown.length > 0) {
      const markdownText = currentMarkdown.join('\n').trim();
      if (markdownText) {
        blocks.push({ 
          type: 'markdown', 
          content: parseMarkdown(markdownText) 
        });
      }
      currentMarkdown = [];
    }
  };
  
  const flushChat = () => {
    if (currentChatSpeaker && currentChatContent.length > 0) {
      const chatText = currentChatContent.join('\n').trim();
      if (chatText) {
        blocks.push({ 
          type: 'chat', 
          content: parseMarkdown(chatText), 
          speakerId: currentChatSpeaker 
        });
      }
      currentChatSpeaker = null;
      currentChatContent = [];
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 【speaker】内容 形式をチェック
    const inlineMatch = line.match(inlineChatPattern);
    if (inlineMatch) {
      flushMarkdown();
      flushChat();
      
      const speakerId = inlineMatch[1].trim();
      const chatContent = inlineMatch[2].trim();
      blocks.push({ 
        type: 'chat', 
        content: parseMarkdown(chatContent), 
        speakerId 
      });
      continue;
    }
    
    // [speaker:id] 形式をチェック（発言内容は次の行以降）
    const speakerMatch = line.match(speakerOnlyPattern);
    if (speakerMatch) {
      flushMarkdown();
      flushChat();
      
      currentChatSpeaker = speakerMatch[1].trim();
      currentChatContent = [];
      continue;
    }
    
    // 現在チャットモードの場合
    if (currentChatSpeaker !== null) {
      // 空行が来たらチャットを終了
      if (line.trim() === '') {
        flushChat();
      } else {
        currentChatContent.push(line);
      }
      continue;
    }
    
    // 通常のMarkdown行
    currentMarkdown.push(line);
  }
  
  // 残りをフラッシュ
  flushMarkdown();
  flushChat();
  
  return blocks;
}

/**
 * コンテンツにチャット記法が含まれているかチェック
 */
export function hasChatContent(content: string): boolean {
  // 両方の記法をチェック
  return /【[^\]]+】/.test(content) || /\[speaker:[^\]]+\]/.test(content);
}
