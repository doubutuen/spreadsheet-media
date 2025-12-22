import React from 'react';
import ChatBubble from './ChatBubble';

interface Speaker {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

interface ParsedBlock {
  type: 'markdown' | 'chat';
  content: string;  // HTMLとしてパース済み
  speakerId?: string;
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
                
                // 交互表示の判定
                if (lastSpeakerId !== speakerId) {
                  alternateCount++;
                  lastSpeakerId = speakerId;
                }
                const isAlternate = alternateCount % 2 === 0;
                
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
