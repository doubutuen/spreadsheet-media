import React from 'react';
import SpeakerAvatar from './SpeakerAvatar';

interface Speaker {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

interface ChatBubbleProps {
  speaker: Speaker;
  content: string;
  isAlternate?: boolean;
}

export default function ChatBubble({ speaker, content, isAlternate = false }: ChatBubbleProps) {
  return (
    <div className={`flex gap-3 mb-4 ${isAlternate ? 'flex-row-reverse' : ''}`}>
      {/* アバター */}
      <div className="flex-shrink-0">
        <SpeakerAvatar
          speakerId={speaker.id}
          name={speaker.name}
          avatar={speaker.avatar}
          size={44}
        />
      </div>
      
      {/* 吹き出し */}
      <div className={`flex-1 max-w-[80%] ${isAlternate ? 'text-right' : ''}`}>
        {/* 名前 */}
        <div className={`text-sm font-medium text-gray-600 mb-1 ${isAlternate ? 'text-right' : ''}`}>
          {speaker.name}
          {speaker.role && (
            <span className="text-gray-400 ml-2 text-xs">{speaker.role}</span>
          )}
        </div>
        
        {/* メッセージ */}
        <div
          className={`inline-block px-4 py-3 rounded-2xl ${
            isAlternate
              ? 'bg-blue-500 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
          style={{ textAlign: 'left' }}
        >
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
