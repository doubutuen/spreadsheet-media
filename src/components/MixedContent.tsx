import React from 'react';
import ChatBubble from './ChatBubble';

interface Speaker {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  position?: 'left' | 'right';  // intervieweesで指定されたデフォルト位置
}

interface ParsedBlock {
  type: 'markdown' | 'chat';
  content: string;  // HTMLとしてパース済み
  speakerId?: string;
  position?: 'left' | 'right';  // 本文中の<>で指定された位置
}

interface MixedContentProps {
  blocks: ParsedBlock[];
  speakers: Speaker[];
}

/**
 * 連続するチャットブロックをグループ化
 */
function groupChatBlocks(blocks: ParsedBlock[]): (ParsedBlock | ParsedBlock[])[] {
  const result: (ParsedBlock | ParsedBlock[])[] = [];
  let currentChatGroup: ParsedBlock[] = [];
  
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

export default function MixedContent({ blocks, speakers }: MixedContentProps) {
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
                
                // 左右配置の決定（優先順位: 本文中の<> > intervieweesのposition > 交互ロジック）
                let isAlternate: boolean;
                
                if (chatBlock.position) {
                  // 本文中の<>指定が最優先
                  isAlternate = chatBlock.position === 'right';
                } else if (speaker.position) {
                  // intervieweesで指定されたposition
                  isAlternate = speaker.position === 'right';
                } else {
                  // 通常の交互ロジック
                  if (lastSpeakerId !== speakerId) {
                    alternateCount++;
                    lastSpeakerId = speakerId;
                  }
                  isAlternate = alternateCount % 2 === 0;
                }
                
                return (
                  <ChatBubble
                    key={chatIndex}
                    speaker={speaker}
                    content={chatBlock.content}
                    isAlternate={isAlternate}
                  />
                );
              })}
            </div>
          );
        } else {
          // Markdownブロック
          return (
            <div
              key={index}
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          );
        }
      })}
    </div>
  );
}
