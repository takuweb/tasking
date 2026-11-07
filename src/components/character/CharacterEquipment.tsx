'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { ShopItem } from '@/types/database';
import HeroAvatar, { getHeroTier } from '@/components/character/HeroAvatar';
import {
  Shield,
  Sword,
  Sparkles,
  Heart,
  Flame,
  ShoppingBag,
  FlaskRound,
  Trophy,
  Award,
  Zap,
} from 'lucide-react';

export default function CharacterEquipment() {
  const { profile, shopItems, inventory, buyItem, equipItem } = useGame();
  const [activeTab, setActiveTab] = useState<'status' | 'inventory' | 'shop'>('status');
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  if (!profile) return null;

  const { tier, title: tierTitle, rankBadge } = getHeroTier(profile.level);

  const equippedWeapon = inventory.find((i) => i.is_equipped && i.shop_item?.item_type === 'weapon');
  const equippedArmor = inventory.find((i) => i.is_equipped && i.shop_item?.item_type === 'armor');
  const equippedAccessory = inventory.find((i) => i.is_equipped && i.shop_item?.item_type === 'accessory');

  const handleBuy = async (item: ShopItem) => {
    const success = await buyItem(item);
    if (success) {
      setPurchaseMsg(`「${item.name}」を購入しました！`);
      setTimeout(() => setPurchaseMsg(null), 3000);
    } else {
      setPurchaseMsg('ゴールドが不足しているか、購入できませんでした。');
      setTimeout(() => setPurchaseMsg(null), 3000);
    }
  };

  const getItemIcon = (name: string) => {
    switch (name) {
      case 'Sword':
        return <Sword className="w-5 h-5 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'FlaskRound':
        return <FlaskRound className="w-5 h-5 text-rose-400" />;
      default:
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="rpg-panel p-2 flex bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'status'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ステータス・形態</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>装備・所持品 ({inventory.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'shop'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>ギルド購買部（ショップ）</span>
        </button>
      </div>

      {purchaseMsg && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold text-center animate-in fade-in">
          {purchaseMsg}
        </div>
      )}

      {/* ステータスタブ */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="rpg-panel p-6 border border-slate-800">
            {/* 上部: 現在の自分の姿と階級 */}
            <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-800 pb-6 mb-6">
              <div className="shrink-0 scale-90 -my-4">
                <HeroAvatar level={profile.level} />
              </div>

              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="mb-2">
                  <span className={`text-[10px] px-3 py-0.5 rounded-full border tracking-wider uppercase ${rankBadge}`}>
                    {tierTitle}
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h3 className="text-2xl font-black text-slate-100">{profile.username}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold">
                    Lv.{profile.level}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{profile.title}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-amber-400 font-bold">
                  <span className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                    <Flame className="w-3.5 h-3.5" /> 所持ゴールド: {profile.gold} G
                  </span>
                </div>
              </div>
            </div>

            {/* 進化形態のロードマップ */}
            <div className="mb-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                勇者の見た目・形態進化の系譜
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                <div className={`p-2 rounded-lg border ${tier >= 1 ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="block text-[9px] opacity-75">Lv.1〜2</span>
                  見習い冒険者
                </div>
                <div className={`p-2 rounded-lg border ${tier >= 2 ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="block text-[9px] opacity-75">Lv.3〜5</span>
                  鋼の戦士
                </div>
                <div className={`p-2 rounded-lg border ${tier >= 3 ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="block text-[9px] opacity-75">Lv.6〜9</span>
                  歴戦の重騎士
                </div>
                <div className={`p-2 rounded-lg border ${tier >= 4 ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="block text-[9px] opacity-75">Lv.10〜14</span>
                  聖光パラディン
                </div>
                <div className={`p-2 rounded-lg border col-span-2 sm:col-span-1 ${tier >= 5 ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold ring-1 ring-amber-400' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
                  <span className="block text-[9px] opacity-75">Lv.15+</span>
                  神話の覚醒勇者
                </div>
              </div>
            </div>

            {/* パラメータグリッド */}
            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
              戦闘ステータス詳細
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-rose-500/20">
                <span className="text-rose-400 font-bold flex items-center gap-1 mb-1">
                  <Heart className="w-3.5 h-3.5" /> 最大HP
                </span>
                <p className="text-xl font-black text-slate-100">{profile.max_hp}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/20">
                <span className="text-amber-400 font-bold flex items-center gap-1 mb-1">
                  <Sword className="w-3.5 h-3.5" /> 攻撃力 (ATK)
                </span>
                <p className="text-xl font-black text-slate-100">{profile.attack}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-blue-500/20">
                <span className="text-blue-400 font-bold flex items-center gap-1 mb-1">
                  <Shield className="w-3.5 h-3.5" /> 防御力 (DEF)
                </span>
                <p className="text-xl font-black text-slate-100">{profile.defense}</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 font-bold flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> 必要EXP
                </span>
                <p className="text-xl font-black text-slate-100">
                  {profile.exp} / {profile.max_exp}
                </p>
              </div>
            </div>

            {/* 実績ダッシュボード */}
            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
              冒険者実績 & ストリーク
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">モンスター討伐数</p>
                  <p className="text-base font-bold text-slate-100">{profile.monsters_defeated} 体</p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">ボスモンスター討伐数</p>
                  <p className="text-base font-bold text-slate-100">{profile.bosses_defeated} 体</p>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">連続達成（ストリーク）</p>
                  <p className="text-base font-bold text-amber-400">{profile.current_streak} 日連続</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 装備・インベントリタブ */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* 現在の装備スロット */}
          <div className="rpg-panel p-5 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
              現在の装備スロット
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 武器 */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Sword className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">武器スロット</span>
                  <p className="font-bold text-xs text-slate-100 truncate">
                    {equippedWeapon?.shop_item?.name || '素手'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {equippedWeapon?.shop_item ? `ATK +${equippedWeapon.shop_item.attack_bonus}` : 'ATK +0'}
                  </p>
                </div>
              </div>

              {/* 防具 */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-blue-500/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">防具スロット</span>
                  <p className="font-bold text-xs text-slate-100 truncate">
                    {equippedArmor?.shop_item?.name || '普段着'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {equippedArmor?.shop_item
                      ? `DEF +${equippedArmor.shop_item.defense_bonus} / HP +${equippedArmor.shop_item.hp_bonus}`
                      : 'DEF +0'}
                  </p>
                </div>
              </div>

              {/* 装飾品 */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-purple-500/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-purple-400 font-bold uppercase">装飾品スロット</span>
                  <p className="font-bold text-xs text-slate-100 truncate">
                    {equippedAccessory?.shop_item?.name || 'なし'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {equippedAccessory?.shop_item
                      ? `ATK +${equippedAccessory.shop_item.attack_bonus} / DEF +${equippedAccessory.shop_item.defense_bonus}`
                      : '効果なし'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 所持品一覧 */}
          <div className="rpg-panel p-5 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
              インベントリ一覧
            </h4>
            {inventory.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                装備やアイテムを所持していません。「ギルド購買部」で購入できます。
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventory.map((inv) => {
                  const item = inv.shop_item;
                  if (!item) return null;
                  return (
                    <div
                      key={inv.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        inv.is_equipped
                          ? 'bg-amber-950/20 border-amber-500/50'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                          {getItemIcon(item.icon_name)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-100 truncate">{item.name}</h5>
                          <p className="text-[11px] text-slate-400">
                            {item.attack_bonus > 0 && `ATK+${item.attack_bonus} `}
                            {item.defense_bonus > 0 && `DEF+${item.defense_bonus} `}
                            {item.hp_bonus > 0 && `HP+${item.hp_bonus}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => equipItem(inv.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          inv.is_equipped
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {inv.is_equipped ? '装備中' : '装備する'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ギルド購買部（ショップ） */}
      {activeTab === 'shop' && (
        <div className="rpg-panel p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-amber-400">ギルド購買部</h4>
              <p className="text-xs text-slate-400">タスク完了で稼いだゴールドで強力な武具を手に入れよう。</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>所持: {profile.gold} G</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {shopItems.map((item) => {
              const canAfford = profile.gold >= item.price;
              const isPurchased = inventory.some((i) => i.item_id === item.id && item.item_type !== 'potion');

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                          {getItemIcon(item.icon_name)}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-100">{item.name}</h5>
                          <span className="text-[10px] text-slate-500">必要レベル: Lv.{item.required_level}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400">{item.price} G</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-300 font-medium">
                      {item.attack_bonus > 0 && <span className="text-amber-400 mr-2">ATK +{item.attack_bonus}</span>}
                      {item.defense_bonus > 0 && <span className="text-blue-400 mr-2">DEF +{item.defense_bonus}</span>}
                      {item.hp_bonus > 0 && <span className="text-rose-400">HP +{item.hp_bonus}</span>}
                    </div>

                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford || (isPurchased && item.item_type !== 'potion')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                        isPurchased && item.item_type !== 'potion'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isPurchased && item.item_type !== 'potion'
                        ? '所持済み'
                        : item.item_type === 'potion'
                        ? '飲む（回復）'
                        : '購入'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
