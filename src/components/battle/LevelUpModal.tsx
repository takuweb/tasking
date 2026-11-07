'use client';

import { useGame } from '@/context/GameContext';
import { Sparkles, ArrowUpCircle, Shield, Sword, Heart, X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import HeroAvatar, { getHeroTier } from '@/components/character/HeroAvatar';

export default function LevelUpModal() {
  const { levelUpModalData, dismissLevelUpModal, profile } = useGame();

  useEffect(() => {
    if (levelUpModalData) {
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#38bdf8', '#a855f7', '#ec4899', '#ffffff'],
      });
    }
  }, [levelUpModalData]);

  if (!levelUpModalData || !profile) return null;

  const oldLevel = levelUpModalData.newLevel - levelUpModalData.levelsGained;
  const newLevel = levelUpModalData.newLevel;
  const oldTier = getHeroTier(oldLevel).tier;
  const newTierData = getHeroTier(newLevel);
  const tierEvolved = newTierData.tier > oldTier;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/90 border-2 border-amber-400 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.5)] text-center overflow-hidden">
        {/* 背景光 */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* 閉じるボタン */}
        <button
          onClick={dismissLevelUpModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 演出ヘッダー */}
        <div className="relative z-10 mb-2">
          {tierEvolved ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider mb-2 animate-bounce">
              <Zap className="w-4 h-4 fill-current" />
              <span>姿の進化・新形態解放！</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>勇者の覚醒</span>
            </div>
          )}

          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-wider">
            LEVEL UP!
          </h3>
          <p className="text-xs text-amber-200/90 font-bold mt-0.5">
            {newTierData.title}
          </p>
        </div>

        {/* 進化した自分自身の姿 */}
        <div className="my-2 flex justify-center scale-90 -my-2 relative z-10">
          <HeroAvatar level={newLevel} isLevelingUp={true} />
        </div>

        {/* ステータス変化 */}
        <div className="my-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative z-10">
          <div className="text-3xl font-extrabold text-amber-400 mb-3 flex items-center justify-center gap-2">
            <span className="text-base text-slate-400 font-normal">Lv.{oldLevel}</span>
            <span className="text-lg text-amber-500">→</span>
            <span className="underline decoration-amber-400 underline-offset-4 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              Lv.{newLevel}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-rose-500/25">
              <div className="flex items-center justify-center gap-1 text-rose-400 font-bold mb-1">
                <Heart className="w-3.5 h-3.5" />
                <span>HP全快</span>
              </div>
              <span className="text-slate-300 font-mono font-bold">
                +{20 * levelUpModalData.levelsGained}
              </span>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/25">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold mb-1">
                <Sword className="w-3.5 h-3.5" />
                <span>攻撃力</span>
              </div>
              <span className="text-slate-300 font-mono font-bold">
                +{5 * levelUpModalData.levelsGained}
              </span>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-blue-500/25">
              <div className="flex items-center justify-center gap-1 text-blue-400 font-bold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>防御力</span>
              </div>
              <span className="text-slate-300 font-mono font-bold">
                +{2 * levelUpModalData.levelsGained}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={dismissLevelUpModal}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition transform active:scale-95 flex items-center justify-center gap-2 relative z-10"
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>この力で次のタスクに挑む</span>
        </button>
      </div>
    </div>
  );
}
