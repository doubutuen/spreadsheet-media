import React from 'react';
import ChatBubble from './ChatBubble';

interface Speaker {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

interface ContentBlock {
  type: 'markdown' | 'chat';
  content: string;
  speakerId?: string;
}

interface MixedContentProps {
  content: string;
  speakers: Speaker[];
  parseMarkdown: (text: string) => string;
}

/**
 * コンテンツをMarkdownブロックとチャットブロックに分割
 */
function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n');
  
  let currentMarkdown: string[] = [];
  const chatPattern = /^【([^\]]+)】(.*)$/;
  
  for (const line of lines) {
    const match = line.match(chatPattern);
    
    if (match) {
      // チャット行を検出
      // 溜まっているMarkdownを先に追加
      if (currentMarkdown.length > 0) {
        const markdownText = currentMarkdown.join('\n').trim();
        if (markdownText) {
          blocks.push({ type: 'markdown', content: markdownText });
        }
        currentMarkdown = [];
      }
      
      // チャットブロックを追加
      const speakerId = match[1].trim();
      const chatContent = match[2].trim();
      blocks.push({ type: 'chat', content: chatContent, speakerId });
    } else {
      // 通常のMarkdown行
      currentMarkdown.push(line);
    }
  }
  
  // 残りのMarkdownを追加
  if (currentMarkdown.length > 0) {
    const markdownText = currentMarkdown.join('\n').trim();
    if (markdownText) {
      blocks.push({ type: 'markdown', content: markdownText });
    }
  }
  
  return blocks;
}

/**
 * 連続するチャットブロックをグループ化
 */
function groupChatBlocks(blocks: ContentBlock[]): (ContentBlock | ContentBlock[])[] {
  const result: (ContentBlock | ContentBlock[])[] = [];
  let currentChatGroup: ContentBlock[] = [];
  
  for (const block of blocks) {
    if (block.type === 'chat') {
      currentChatGroup.push(block);
    } else {
      if (currentChatGroup.length > 0) {
        result.push(currentChatGroup);
        currentChatGroup = [];
      }
      result.push(block);
    }
  }
  
  if (currentChatGroup.length > 0) {
    result.push(currentChatGroup);
  }
  
  return result;
}

export default function MixedContent({ content, speakers, parseMarkdown }: MixedContentProps) {
  const blocks = parseContent(content);
  const groupedBlocks = groupChatBlocks(blocks);
  
  // スピーカーマップを作成
  const speakerMap = new Map(speakers.map(s => [s.id.toLowerCase(), s]));
  
  // 交互表示のためのスピーカー追跡
  let lastSpeakerId: string | null = null;
  let alternateCount = 0;
  
  return (
    <div className="mixed-content">
      {groupedBlocks.map((item, index) => {
        if (Array.isArray(item)) {
          // チャットグループ
          return (
            <div key={index} className="chat-group my-6 p-4 bg-gray-50 rounded-xl">
              {item.map((chatBlock, chatIndex) => {
                const speakerId = chatBlock.speakerId?.toLowerCase() || '';
                const speaker = speakerMap.get(speakerId) || {
                  id: speakerId,
                  name: chatBlock.speakerId || 'Unknown',
                };
                
                // 交互表示の判定
                if (lastSpeakerId !== speakerId) {
                  alternateCount++;
                  lastSpeakerId = speakerId;
                }
                const isAlternate = alternateCount % 2 === 0;
                
                // チャット内容をMarkdownとしてパース
                const parsedContent = parseMarkdown(chatBlock.content);
                
                return (
                  <ChatBubble
                    key={chatIndex}
                    speaker={speaker}
                    content={parsedContent}
                    isAlternate={isAlternate}
                  />
                );
              })}
            </div>
          );
        } else {
          // Markdownブロック
          const parsedHtml = parseMarkdown(item.content);
          return (
            <div
              key={index}
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />
          );
        }
      })}
    </div>
  );
}
