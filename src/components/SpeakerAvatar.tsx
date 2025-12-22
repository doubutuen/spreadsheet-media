import React from 'react';

interface SpeakerAvatarProps {
  speakerId: string;
  name: string;
  avatar?: string;
  size?: number;
}

// 共通のアイコンラッパー（縁線付き）
const IconWrapper = ({ children, size, bgColor = '#fff' }: { children: React.ReactNode; size: number; bgColor?: string }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '2px solid #e5e7eb',
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

// Geminiアイコン（@lobehub/iconsから抽出）
const GeminiIcon = ({ size }: { size: number }) => {
  const innerSize = size * 0.7;
  return (
    <IconWrapper size={size}>
      <svg width={innerSize} height={innerSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="#4285F4"/>
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gemini-a)"/>
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gemini-b)"/>
        <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" fill="url(#gemini-c)"/>
        <defs>
          <linearGradient id="gemini-a" x1="7" x2="11" y1="15.5" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#08B962"/>
            <stop offset="1" stopColor="#08B962" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gemini-b" x1="8" x2="11.5" y1="5.5" y2="11" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F94543"/>
            <stop offset="1" stopColor="#F94543" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gemini-c" x1="3.5" x2="17.5" y1="13.5" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FABC12"/>
            <stop offset=".46" stopColor="#FABC12" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </IconWrapper>
  );
};

// OpenAI/ChatGPTアイコン（白背景に黒アイコン）
const OpenAIIcon = ({ size }: { size: number }) => {
  const innerSize = size * 0.6;
  return (
    <IconWrapper size={size}>
      <svg width={innerSize} height={innerSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#000" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    </IconWrapper>
  );
};

// Grokアイコン（黒背景に白アイコン）
const GrokIcon = ({ size }: { size: number }) => {
  const innerSize = size * 0.55;
  return (
    <IconWrapper size={size} bgColor="#000">
      <svg width={innerSize} height={innerSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"/>
      </svg>
    </IconWrapper>
  );
};

// Manusアイコン（白背景に黒アイコン - 手のアイコン）
const ManusIcon = ({ size }: { size: number }) => {
  const innerSize = size * 0.65;
  return (
    <IconWrapper size={size}>
      <svg width={innerSize} height={innerSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path fill="#000" d="M12 6c-1.1 0-2 .9-2 2v3H8c-1.1 0-2 .9-2 2s.9 2 2 2h2v1c0 1.1.9 2 2 2s2-.9 2-2v-1h2c1.1 0 2-.9 2-2s-.9-2-2-2h-2V8c0-1.1-.9-2-2-2z"/>
        <circle fill="#000" cx="9" cy="9" r="1.5"/>
        <circle fill="#000" cx="15" cy="9" r="1.5"/>
        <path fill="#000" d="M12 17c-1.5 0-2.7-.8-3.4-2h6.8c-.7 1.2-1.9 2-3.4 2z"/>
      </svg>
    </IconWrapper>
  );
};

// Claudeアイコン
const ClaudeIcon = ({ size }: { size: number }) => {
  const innerSize = size * 0.6;
  return (
    <IconWrapper size={size} bgColor="#D97757">
      <svg width={innerSize} height={innerSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="M4.709 15.955l4.397-10.985a1.763 1.763 0 0 1 3.278 0l4.844 12.093a1.763 1.763 0 0 1-1.639 2.437H6.348a1.763 1.763 0 0 1-1.639-2.437v-.108z"/>
        <circle fill="#fff" cx="17" cy="7" r="2.5"/>
      </svg>
    </IconWrapper>
  );
};

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
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <img
          src={avatar}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }
  
  // デフォルト: イニシャルアイコン
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    ['#3b82f6', '#06b6d4'], // blue to cyan
    ['#22c55e', '#10b981'], // green to emerald
    ['#f97316', '#f59e0b'], // orange to amber
    ['#ec4899', '#f43f5e'], // pink to rose
    ['#8b5cf6', '#a855f7'], // violet to purple
    ['#ef4444', '#f97316'], // red to orange
    ['#14b8a6', '#22c55e'], // teal to green
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const [color1, color2] = colors[colorIndex];
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: size * 0.4,
      }}
    >
      {initial}
    </div>
  );
}
