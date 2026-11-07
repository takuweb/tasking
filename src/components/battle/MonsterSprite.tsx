import { MonsterType } from '@/types/database';

interface MonsterSpriteProps {
  type: MonsterType;
  isBoss?: boolean;
  isTakingDamage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MonsterSprite({
  type,
  isBoss,
  isTakingDamage,
  size = 'md',
}: MonsterSpriteProps) {
  const shakeClass = isTakingDamage ? 'animate-shake' : 'animate-float';

  // サイズ別のスタイル設定
  const sizeMap = {
    sm: {
      container: 'w-9 h-9',
      svg: 'w-8 h-8',
      aura: 'w-12 h-12',
    },
    md: {
      container: 'w-28 h-28',
      svg: 'w-24 h-24',
      aura: 'w-32 h-32',
    },
    lg: {
      container: 'w-36 h-36',
      svg: 'w-32 h-32',
      aura: 'w-44 h-44',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${currentSize.container} transition-transform ${shakeClass}`}
    >
      {/* ボス用の邪悪なオーラ発光 */}
      {isBoss && (
        <div
          className={`absolute ${currentSize.aura} rounded-full bg-rose-600/25 blur-lg animate-pulse-glow pointer-events-none`}
        />
      )}

      {/* スライム */}
      {type === 'slime' && (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.svg} drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]`}
        >
          <defs>
            <linearGradient id="slimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <path
            d="M 50 15 C 75 15, 92 45, 90 75 C 88 92, 12 92, 10 75 C 8 45, 25 15, 50 15 Z"
            fill="url(#slimeGrad)"
          />
          <ellipse cx="38" cy="32" rx="14" ry="7" fill="#a7f3d0" opacity="0.6" transform="rotate(-15 38 32)" />
          <ellipse cx="35" cy="55" rx="5" ry="7" fill="#022c22" />
          <ellipse cx="65" cy="55" rx="5" ry="7" fill="#022c22" />
          <circle cx="36" cy="53" r="2" fill="#ffffff" />
          <circle cx="66" cy="53" r="2" fill="#ffffff" />
          <path d="M 45 68 Q 50 74 55 68" stroke="#022c22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {/* ゴブリン */}
      {type === 'goblin' && (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.svg} drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]`}
        >
          <defs>
            <linearGradient id="goblinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <polygon points="10,40 32,50 25,65" fill="#d97706" />
          <polygon points="90,40 68,50 75,65" fill="#d97706" />
          <circle cx="50" cy="55" r="30" fill="url(#goblinGrad)" />
          <polygon points="32,48 44,52 35,58" fill="#ef4444" />
          <polygon points="68,48 56,52 65,58" fill="#ef4444" />
          <circle cx="38" cy="52" r="2" fill="#fff" />
          <circle cx="62" cy="52" r="2" fill="#fff" />
          <path d="M 38 68 Q 50 78 62 68" stroke="#78350f" strokeWidth="3" fill="#78350f" />
          <polygon points="42,66 45,61 48,66" fill="#fff" />
          <polygon points="52,66 55,61 58,66" fill="#fff" />
        </svg>
      )}

      {/* スケルトン */}
      {type === 'skeleton' && (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.svg} drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]`}
        >
          <defs>
            <linearGradient id="skelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <path d="M 25 45 C 25 22, 75 22, 75 45 C 75 58, 68 62, 65 72 L 35 72 C 32 62, 25 58, 25 45 Z" fill="url(#skelGrad)" />
          <ellipse cx="38" cy="45" rx="7" ry="9" fill="#0f172a" />
          <ellipse cx="62" cy="45" rx="7" ry="9" fill="#0f172a" />
          <circle cx="39" cy="46" r="3" fill="#60a5fa" />
          <circle cx="63" cy="46" r="3" fill="#60a5fa" />
          <polygon points="50,56 46,62 54,62" fill="#0f172a" />
          <path d="M 37 72 L 37 78 M 43 72 L 43 78 M 50 72 L 50 78 M 57 72 L 57 78 M 63 72 L 63 78" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
      )}

      {/* ゴーレム */}
      {type === 'golem' && (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.svg} drop-shadow-[0_2px_8px_rgba(139,92,246,0.35)]`}
        >
          <defs>
            <linearGradient id="golemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>
          <polygon points="10,35 30,20 35,50 15,60" fill="#4c1d95" />
          <polygon points="90,35 70,20 65,50 85,60" fill="#4c1d95" />
          <polygon points="25,25 75,25 85,75 15,75" fill="url(#golemGrad)" />
          <path d="M 30 35 L 45 42 L 40 58 L 55 65" stroke="#c084fc" strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="45" r="9" fill="#0f172a" />
          <circle cx="50" cy="45" r="6" fill="#f43f5e" />
          <circle cx="50" cy="45" r="2.5" fill="#fff" />
        </svg>
      )}

      {/* ドラゴン (ボス) */}
      {type === 'dragon' && (
        <svg
          viewBox="0 0 120 120"
          className={`${currentSize.svg} drop-shadow-[0_2px_12px_rgba(239,68,68,0.5)]`}
        >
          <defs>
            <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
          </defs>
          <path d="M 25 35 Q 5 10 0 35 Q 15 50 30 55 Z" fill="#7f1d1d" />
          <path d="M 95 35 Q 115 10 120 35 Q 105 50 90 55 Z" fill="#7f1d1d" />
          <polygon points="40,25 30,5 45,18" fill="#fbbf24" />
          <polygon points="80,25 90,5 75,18" fill="#fbbf24" />
          <polygon points="35,30 85,30 95,70 60,95 25,70" fill="url(#dragonGrad)" />
          <polygon points="40,48 52,44 48,56" fill="#fbbf24" />
          <polygon points="80,48 68,44 72,56" fill="#fbbf24" />
          <line x1="46" y1="46" x2="46" y2="54" stroke="#000" strokeWidth="2" />
          <line x1="74" y1="46" x2="74" y2="54" stroke="#000" strokeWidth="2" />
          <polygon points="50,85 53,75 56,85" fill="#fff" />
          <polygon points="64,85 67,75 70,85" fill="#fff" />
          <circle cx="60" cy="98" r="6" fill="#f59e0b" opacity="0.8" className="animate-pulse" />
        </svg>
      )}
    </div>
  );
}
