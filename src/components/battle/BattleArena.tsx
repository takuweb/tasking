'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import HeroAvatar, { getHeroTier } from '@/components/character/HeroAvatar';
import MonsterSprite from './MonsterSprite';
import {
  Shield,
  Sword,
  Heart,
  Sparkles,
  Skull,
  Flame,
  Trophy,
  Scroll,
  Crosshair,
  Zap,
} from 'lucide-react';

export default function BattleArena() {
  const { profile, battleState, lastAttackResult, logs } = useGame();
  const [isHeroAttacking, setIsHeroAttacking] = useState(false);
  const [showDamageEffect, setShowDamageEffect] = useState(false);

  useEffect(() => {
    if (lastAttackResult) {
      setIsHeroAttacking(true);
      setShowDamageEffect(true);
      const attackTimer = setTimeout(() => setIsHeroAttacking(false), 500);
      const damageTimer = setTimeout(() => setShowDamageEffect(false), 1200);
      return () => {
        clearTimeout(attackTimer);
        clearTimeout(damageTimer);
      };
    }
  }, [lastAttackResult]);

  if (!profile || !battleState) return null;

  const { tier, title: tierTitle, rankBadge } = getHeroTier(profile.level);
  const monsterHpPercent = Math.max(0, Math.min(100, Math.round((battleState.current_hp / battleState.max_hp) * 100)));
  const playerHpPercent = Math.max(0, Math.min(100, Math.round((profile.hp / profile.max_hp) * 100)));
  const playerExpPercent = Math.max(0, Math.min(100, Math.round((profile.exp / profile.max_exp) * 100)));

  return (
    <div className="space-y-6">
      {/* メインヒーローステージ（主人公が大画面中央の主役！） */}
      <div className="rpg-panel p-6 relative overflow-hidden rpg-panel-glow border border-amber-500/20">
        {/* 背景の魔方陣光彩 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 上部ヘッダー: ステージ情報 & 現在交戦中の敵ターゲット(独立して綺麗にレイアウト) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-6">
          {/* 左側: ステージ階層 */}
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-slate-300">
              第 {profile.stage_level} 階層 ダンジョン
            </span>
          </div>

          {/* 右側: 標的モンスター（コンパクトな独立ターゲットカード・重なり完全解消） */}
          <div className="flex items-center gap-2.5 bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-xl shadow-md">
            {/* 標的ラベル */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 shrink-0">
              <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>標的:</span>
            </div>

            {/* モンスター小アイコン (サイズsm指定で枠内にピッタリ収まる) */}
            <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-slate-950/80 rounded-lg border border-slate-800">
              <MonsterSprite
                type={battleState.monster_type}
                isBoss={battleState.is_boss}
                size="sm"
              />
            </div>

            {/* モンスター名 & HPバー */}
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-200 truncate max-w-[120px]">
                  {battleState.monster_name}
                </span>
                {battleState.is_boss && (
                  <span className="text-[9px] bg-rose-500/30 text-rose-300 px-1 py-0.2 rounded border border-rose-500/40 font-black shrink-0">
                    BOSS
                  </span>
                )}
              </div>

              {/* ミニHPバー */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${monsterHpPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {battleState.current_hp}/{battleState.max_hp}
                </span>
              </div>
            </div>

            {/* 被ダメージ・クリティカルのインラインバッジ演出 */}
            {showDamageEffect && lastAttackResult && (
              <div className="ml-1 shrink-0 px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/60 text-rose-300 text-[11px] font-black animate-bounce shadow">
                -{lastAttackResult.damage}
                {lastAttackResult.isCritical && ' ⚡'}
              </div>
            )}
          </div>
        </div>

        {/* 中央: 自分自身（主人公キャラクター）の大画面ビジュアル */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          {/* 主人公の階級・称号バッジ */}
          <div className="mb-2">
            <span className={`text-[11px] px-3.5 py-1 rounded-full border shadow-sm tracking-wider uppercase ${rankBadge}`}>
              {tierTitle}
            </span>
          </div>

          {/* 大画面の主人公キャラクターSVG */}
          <div className="my-1 cursor-pointer">
            <HeroAvatar
              level={profile.level}
              isAttacking={isHeroAttacking}
            />
          </div>

          {/* 主人公の名前と現在の進化レベル */}
          <div className="text-center mt-3">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-black text-slate-100 tracking-wide drop-shadow-md">
                {profile.username}
              </h2>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Lv.{profile.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              第{tier}段階形態 • {profile.title}
            </p>
          </div>

          {/* 成長バー: 勇者HP ＆ EXPゲージ (主人公の足元に大きく配置) */}
          <div className="w-full max-w-md mx-auto mt-5 space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 shadow-inner">
            {/* HPバー */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> 勇者HP
                </span>
                <span className="font-mono text-slate-200">
                  {profile.hp} / {profile.max_hp}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>
            </div>

            {/* EXPバー */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 経験値 (EXP)
                </span>
                <span className="font-mono text-slate-200">
                  {profile.exp} / {profile.max_exp} ({playerExpPercent}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 via-teal-400 to-blue-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  style={{ width: `${playerExpPercent}%` }}
                />
              </div>
            </div>

            {/* 進化予告インフォ */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                次の形態変化:
              </span>
              <strong className="text-amber-300 font-semibold">
                {profile.level < 3
                  ? 'Lv.3 で「鋼の戦士」へ進化'
                  : profile.level < 6
                  ? 'Lv.6 で「歴戦の重騎士」へ進化'
                  : profile.level < 10
                  ? 'Lv.10 で「聖光のパラディン」へ進化'
                  : profile.level < 15
                  ? 'Lv.15 で「神話の覚醒勇者」へ進化'
                  : '最高位・神話形態到達！'}
              </strong>
            </div>
          </div>
        </div>

        {/* パラメータ概要カード */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sword className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">攻撃力</p>
              <p className="font-bold text-slate-100">{profile.attack}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-blue-500/20 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">防御力</p>
              <p className="font-bold text-slate-100">{profile.defense}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/20 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Skull className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">討伐数</p>
              <p className="font-bold text-slate-100">{profile.monsters_defeated} 体</p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">所持Gold</p>
              <p className="font-bold text-amber-400">{profile.gold} G</p>
            </div>
          </div>
        </div>
      </div>

      {/* バトルログカード */}
      <div className="rpg-panel p-4 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2.5">
          <Scroll className="w-3.5 h-3.5 text-amber-400" />
          冒険・戦闘ログ
        </h4>
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">タスクを完了するとログが記録されます...</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`py-1.5 px-2.5 rounded-lg border text-[11px] leading-relaxed ${
                  log.log_type === 'kill'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold'
                    : log.log_type === 'level_up'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold'
                    : log.log_type === 'damage'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
