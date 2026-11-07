'use client';

import React from 'react';

interface HeroAvatarProps {
  level: number;
  isAttacking?: boolean;
  isLevelingUp?: boolean;
}

export function getHeroTier(level: number): {
  tier: number;
  title: string;
  rankBadge: string;
  auraColor: string;
  glowColor: string;
} {
  if (level >= 15) {
    return {
      tier: 5,
      title: '神話の覚醒勇者 (Mythic Hero)',
      rankBadge: 'bg-gradient-to-r from-purple-500 via-amber-400 to-pink-500 text-slate-950 font-black border-amber-300',
      auraColor: 'from-amber-400/30 via-purple-500/30 to-pink-500/20',
      glowColor: 'drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]',
    };
  }
  if (level >= 10) {
    return {
      tier: 4,
      title: '聖光のパラディン (Holy Paladin)',
      rankBadge: 'bg-gradient-to-r from-blue-400 to-amber-300 text-slate-950 font-black border-blue-300',
      auraColor: 'from-blue-400/25 via-cyan-300/20 to-amber-400/20',
      glowColor: 'drop-shadow-[0_0_25px_rgba(56,189,248,0.5)]',
    };
  }
  if (level >= 6) {
    return {
      tier: 3,
      title: '歴戦の重騎士 (Knight Commander)',
      rankBadge: 'bg-gradient-to-r from-slate-200 to-blue-400 text-slate-900 font-extrabold border-slate-300',
      auraColor: 'from-blue-500/20 to-indigo-600/20',
      glowColor: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    };
  }
  if (level >= 3) {
    return {
      tier: 2,
      title: '鋼の戦士 (Iron Warrior)',
      rankBadge: 'bg-slate-800 text-amber-300 font-bold border-amber-500/40',
      auraColor: 'from-amber-500/15 to-orange-600/10',
      glowColor: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    };
  }
  return {
    tier: 1,
    title: '見習い冒険者 (Novice Adventurer)',
    rankBadge: 'bg-slate-800 text-slate-300 font-semibold border-slate-700',
    auraColor: 'from-slate-700/10 to-transparent',
    glowColor: 'drop-shadow-[0_0_8px_rgba(148,163,184,0.2)]',
  };
}

export default function HeroAvatar({ level, isAttacking = false, isLevelingUp = false }: HeroAvatarProps) {
  const { tier, auraColor, glowColor } = getHeroTier(level);

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* 背後の魔導陣 & 段階別オーラ */}
      <div
        className={`absolute w-72 h-72 rounded-full bg-gradient-to-r ${auraColor} blur-2xl pointer-events-none transition-all duration-700 ${
          tier >= 4 ? 'animate-pulse-glow' : ''
        }`}
      />

      {/* レベルアップ時の金色の光柱エフェクト */}
      {isLevelingUp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-48 h-96 bg-gradient-to-t from-amber-400/80 via-yellow-200/50 to-transparent blur-lg animate-pulse" />
        </div>
      )}

      {/* 主人公SVGスプライト (大画面・高密度) */}
      <div
        className={`relative z-10 transition-transform duration-300 ${glowColor} ${
          isAttacking ? 'scale-110 -translate-y-2' : 'hover:scale-105'
        }`}
      >
        <svg
          viewBox="0 0 240 260"
          className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* 髪・肌・マントグラデーション */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>

            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            {/* 鎧のグラデーション (Tier別) */}
            <linearGradient id="armorTier1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="armorTier2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="armorTier3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            <linearGradient id="armorTier4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            <linearGradient id="armorTier5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>

            {/* 剣の光グラデーション */}
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="bladeGradMythic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* ======================= Tier 4 & 5: 背中の神聖な翼 / ルーン光輪 ======================= */}
          {tier >= 4 && (
            <g opacity={tier === 5 ? '0.95' : '0.8'} className="animate-pulse">
              {/* 光の翼 (左) */}
              <path
                d="M 90 120 C 40 80, 10 90, 5 140 C 25 145, 55 135, 90 145 Z"
                fill={tier === 5 ? 'url(#bladeGradMythic)' : 'url(#bladeGrad)'}
                opacity="0.8"
              />
              <path
                d="M 90 110 C 30 50, 15 70, 0 110 C 30 115, 60 110, 90 130 Z"
                fill="#fef08a"
                opacity="0.9"
              />
              {/* 光の翼 (右) */}
              <path
                d="M 150 120 C 200 80, 230 90, 235 140 C 215 145, 185 135, 150 145 Z"
                fill={tier === 5 ? 'url(#bladeGradMythic)' : 'url(#bladeGrad)'}
                opacity="0.8"
              />
              <path
                d="M 150 110 C 210 50, 225 70, 240 110 C 210 115, 180 110, 150 130 Z"
                fill="#fef08a"
                opacity="0.9"
              />
            </g>
          )}

          {/* ======================= 背後のマント (Tier 2以上) ======================= */}
          {tier >= 2 && (
            <path
              d="M 85 115 Q 120 140 155 115 L 180 230 Q 120 245 60 230 Z"
              fill={tier >= 4 ? '#b91c1c' : tier === 3 ? '#1e3a8a' : '#7f1d1d'}
              stroke="#0f172a"
              strokeWidth="2"
            />
          )}

          {/* ======================= 脚部 & ブーツ ======================= */}
          {/* 左足 */}
          <rect x="95" y="195" width="20" height="45" rx="5" fill="#1e293b" />
          <rect
            x="92"
            y="225"
            width="25"
            height="20"
            rx="4"
            fill={tier >= 4 ? '#d97706' : tier >= 2 ? '#475569' : '#334155'}
          />
          {/* 右足 */}
          <rect x="125" y="195" width="20" height="45" rx="5" fill="#1e293b" />
          <rect
            x="123"
            y="225"
            width="25"
            height="20"
            rx="4"
            fill={tier >= 4 ? '#d97706' : tier >= 2 ? '#475569' : '#334155'}
          />

          {/* ======================= 胴体・鎧 (レベル進行で進化) ======================= */}
          <path
            d="M 85 110 L 155 110 L 148 200 L 92 200 Z"
            fill={
              tier === 5
                ? 'url(#armorTier5)'
                : tier === 4
                ? 'url(#armorTier4)'
                : tier === 3
                ? 'url(#armorTier3)'
                : tier === 2
                ? 'url(#armorTier2)'
                : 'url(#armorTier1)'
            }
            stroke="#0f172a"
            strokeWidth="2.5"
          />

          {/* 鎧の紋章 / 装飾 (Tier 3以上で紋章が金色に) */}
          {tier >= 3 && (
            <polygon
              points="120,130 132,150 120,170 108,150"
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth="1.5"
            />
          )}
          {tier >= 4 && (
            <circle cx="120" cy="150" r="5" fill="#38bdf8" className="animate-pulse" />
          )}

          {/* 肩当て (Pauldrons) */}
          {tier >= 2 && (
            <>
              {/* 左肩当て */}
              <path
                d="M 70 110 Q 85 90 95 115 L 85 135 Z"
                fill={tier >= 4 ? '#f59e0b' : tier >= 3 ? '#94a3b8' : '#64748b'}
                stroke="#0f172a"
                strokeWidth="2"
              />
              {/* 右肩当て */}
              <path
                d="M 170 110 Q 155 90 145 115 L 155 135 Z"
                fill={tier >= 4 ? '#f59e0b' : tier >= 3 ? '#94a3b8' : '#64748b'}
                stroke="#0f172a"
                strokeWidth="2"
              />
            </>
          )}

          {/* ======================= 首・頭部 ======================= */}
          <rect x="110" y="95" width="20" height="18" fill="url(#skinGrad)" />
          {/* 顔 */}
          <ellipse cx="120" cy="80" rx="26" ry="30" fill="url(#skinGrad)" />

          {/* 目 */}
          <ellipse cx="110" cy="80" rx="3.5" ry="4.5" fill="#0f172a" />
          <ellipse cx="130" cy="80" rx="3.5" ry="4.5" fill="#0f172a" />
          <circle cx="111" cy="79" r="1.5" fill="#ffffff" />
          <circle cx="131" cy="79" r="1.5" fill="#ffffff" />

          {/* 自信に満ちた口元 */}
          <path d="M 115 95 Q 120 100 125 95" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* 髪型 */}
          <path
            d="M 92 75 C 90 45, 150 45, 148 75 C 152 70, 155 90, 145 85 C 135 60, 105 60, 95 85 Z"
            fill="url(#hairGrad)"
          />
          {/* 前髪 */}
          <polygon points="105,65 112,78 116,65" fill="#eab308" />
          <polygon points="116,65 122,80 126,65" fill="#eab308" />
          <polygon points="126,65 132,77 136,65" fill="#ca8a04" />

          {/* ======================= 兜 / サークレット (Tier別) ======================= */}
          {tier >= 4 ? (
            // 神聖サークレット / 王冠
            <g>
              <path d="M 94 65 L 120 45 L 146 65 L 138 70 L 120 58 L 102 70 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
              <polygon points="120,40 125,50 115,50" fill="#38bdf8" />
            </g>
          ) : tier >= 2 ? (
            // 戦士の額当て
            <path d="M 94 68 Q 120 62 146 68 L 145 74 Q 120 68 95 74 Z" fill={tier === 3 ? '#94a3b8' : '#78350f'} />
          ) : null}

          {/* ======================= 右手 & 武器 (成長する剣) ======================= */}
          <g className={`transition-transform duration-200 origin-[160px_130px] ${isAttacking ? 'rotate-45' : ''}`}>
            {/* 腕 */}
            <path d="M 150 120 L 175 145 L 165 155 L 145 135 Z" fill="url(#skinGrad)" />

            {/* 武器 (Tier別) */}
            {tier === 1 && (
              // 旅人の短剣
              <g transform="translate(170, 105) rotate(-25)">
                <rect x="0" y="0" width="8" height="45" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                <rect x="-6" y="38" width="20" height="5" rx="1" fill="#78350f" />
                <rect x="2" y="43" width="4" height="15" fill="#92400e" />
              </g>
            )}

            {tier === 2 && (
              // 鋼鉄のブロードソード
              <g transform="translate(170, 80) rotate(-20)">
                <polygon points="5,-5 12,15 12,75 -2,75 -2,15" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
                <rect x="-10" y="75" width="30" height="7" rx="2" fill="#475569" />
                <rect x="1" y="82" width="8" height="18" fill="#1e293b" />
                <circle cx="5" cy="103" r="5" fill="#f59e0b" />
              </g>
            )}

            {tier === 3 && (
              // 騎士の白銀大剣
              <g transform="translate(170, 50) rotate(-18)">
                <polygon points="7,-15 16,15 14,105 0,105 -2,15" fill="url(#bladeGrad)" stroke="#1e3a8a" strokeWidth="2" />
                <path d="M -12 105 L 26 105 L 7 115 Z" fill="#fbbf24" />
                <rect x="3" y="115" width="8" height="22" fill="#0f172a" />
                <circle cx="7" cy="140" r="6" fill="#38bdf8" />
              </g>
            )}

            {tier >= 4 && (
              // 聖剣 / 神話の魔導剣 (オーラ発光)
              <g transform="translate(165, 30) rotate(-15)">
                {/* 剣の光波オーラ */}
                <polygon
                  points="9,-30 24,15 20,130 -2,130 -6,15"
                  fill={tier === 5 ? 'url(#bladeGradMythic)' : 'url(#bladeGrad)'}
                  opacity="0.9"
                  className="animate-pulse"
                />
                <polygon points="9,-25 18,15 15,125 3,125 0,15" fill="#ffffff" />
                {/* 黄金の柄・護拳 */}
                <path d="M -16 125 L 34 125 L 9 138 Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
                <circle cx="9" cy="132" r="6" fill={tier === 5 ? '#f43f5e' : '#38bdf8'} />
                <rect x="5" y="138" width="8" height="26" fill="#1e1b4b" />
                <polygon points="2,164 16,164 9,174" fill="#fbbf24" />
              </g>
            )}
          </g>

          {/* ======================= 左手 & 盾 (Tier 2以上で出現) ======================= */}
          <g>
            {/* 左腕 */}
            <path d="M 85 125 L 60 150 L 70 160 L 95 135 Z" fill="url(#skinGrad)" />

            {tier >= 3 && (
              // 白銀のエンブレム盾
              <g transform="translate(40, 130)">
                <path
                  d="M 5 0 L 35 0 C 35 25, 30 50, 20 65 C 10 50, 5 25, 5 0 Z"
                  fill={tier >= 4 ? '#1e1b4b' : '#334155'}
                  stroke={tier >= 4 ? '#fbbf24' : '#94a3b8'}
                  strokeWidth="2.5"
                />
                {/* 盾の中央紋章 */}
                <polygon points="20,15 28,30 20,45 12,30" fill={tier >= 4 ? '#fbbf24' : '#38bdf8'} />
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
