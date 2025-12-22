import React from 'react';

interface SpeakerAvatarProps {
  speakerId: string;
  name: string;
  avatar?: string;
  size?: number;
}

// Geminiアイコン
const GeminiIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="24" fill="url(#gemini-gradient)" />
    <path d="M24 12C24 12 24 24 24 24C24 24 12 24 12 24C12 24 24 24 24 24C24 24 24 36 24 36C24 36 24 24 24 24C24 24 36 24 36 24C36 24 24 24 24 24C24 24 24 12 24 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="gemini-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

// OpenAI/ChatGPTアイコン
const OpenAIIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="24" fill="#10A37F"/>
    <path d="M33.6 21.6C34.1 19.3 33.3 16.9 31.5 15.3C28.8 12.9 24.7 12.8 21.9 15.1C19.7 14.1 17.1 14.5 15.3 16.3C12.7 18.9 12.5 23 14.8 25.9C14.3 28.2 15.1 30.6 16.9 32.2C19.6 34.6 23.7 34.7 26.5 32.4C28.7 33.4 31.3 33 33.1 31.2C35.7 28.6 35.9 24.5 33.6 21.6ZM26.1 31C25.2 31.5 24.1 31.6 23.1 31.3L22.5 31.1L22 31.5C20.6 32.6 18.6 32.6 17.2 31.5C15.8 30.4 15.3 28.5 15.9 26.9L16.1 26.3L15.7 25.8C14.5 24.4 14.4 22.4 15.5 20.9C16.6 19.4 18.5 18.8 20.2 19.4L20.8 19.6L21.3 19.2C22.7 18.1 24.7 18.1 26.1 19.2C27.5 20.3 28 22.2 27.4 23.8L27.2 24.4L27.6 24.9C28.8 26.3 28.9 28.3 27.8 29.8C27.4 30.3 26.8 30.7 26.1 31Z" fill="white"/>
  </svg>
);

// Grokアイコン
const GrokIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="24" fill="#000000"/>
    <path d="M14 24L24 14L34 24L24 34L14 24Z" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="24" r="4" fill="white"/>
  </svg>
);

// Manusアイコン
const ManusIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="24" fill="url(#manus-gradient)"/>
    <path d="M16 32V20L24 14L32 20V32L24 28L16 32Z" fill="white" fillOpacity="0.9"/>
    <defs>
      <linearGradient id="manus-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>
);

// Claudeアイコン
const ClaudeIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="24" fill="#D97757"/>
    <path d="M24 14C18.5 14 14 18.5 14 24C14 29.5 18.5 34 24 34C29.5 34 34 29.5 34 24C34 18.5 29.5 14 24 14ZM24 30C20.7 30 18 27.3 18 24C18 20.7 20.7 18 24 18C27.3 18 30 20.7 30 24C30 27.3 27.3 30 24 30Z" fill="white"/>
  </svg>
);

// AIアイコンのマッピング
const AI_ICONS: Record<string, React.ComponentType<{ size: number }>> = {
  gemini: GeminiIcon,
  openai: OpenAIIcon,
  chatgpt: OpenAIIcon,
  gpt: OpenAIIcon,
  grok: GrokIcon,
  manus: ManusIcon,
  claude: ClaudeIcon,
};

export default function SpeakerAvatar({ speakerId, name, avatar, size = 40 }: SpeakerAvatarProps) {
  const normalizedId = speakerId.toLowerCase();
  
  // AIアイコンが利用可能な場合
  const AIIcon = AI_ICONS[normalizedId];
  if (AIIcon) {
    return <AIIcon size={size} />;
  }
  
  // カスタムアバター画像がある場合（Base64またはURL）
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  
  // デフォルト: イニシャルアイコン
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-red-500 to-orange-500',
    'from-teal-500 to-green-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
