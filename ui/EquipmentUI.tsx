import React, { useState } from 'react';
import { GameStateManager } from '../engine/GameStateManager';
import { Equipment, EquipmentSlot } from '../domain/types';
import { EQUIPMENT_DATA } from '../data/equipment';
import { getTranslation } from '../localization/strings';

interface EquipmentUIProps {
    gsm: GameStateManager;
    onClose: () => void;
}

export const EquipmentUI: React.FC<EquipmentUIProps> = ({ gsm, onClose }) => {
    const state = gsm.getState();
    const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
    const [filter, setFilter] = useState<'all' | 'weapon' | 'armor' | 'accessory'>('all');

    const t = getTranslation(state.language);
    const lang = state.language;

    const equippedItems = state.tamer.equippedItems;
    const equippedStats = gsm.getEquippedStats();
    const tamerStats = gsm.getTamerEffectiveStats();

    // Get equipment in inventory
    const inventoryEquipment = state.tamer.inventory
        .filter(inv => {
            const eq = EQUIPMENT_DATA.find(e => e.id === inv.itemId);
            return eq !== undefined;
        })
        .map(inv => ({
            ...EQUIPMENT_DATA.find(e => e.id === inv.itemId)!,
            quantity: inv.quantity
        }));

    // Filter equipment
    const filteredEquipment = inventoryEquipment.filter(eq => {
        if (filter === 'all') return true;
        if (filter === 'weapon') return eq.slot === 'weapon';
        if (filter === 'armor') return eq.slot === 'armor';
        if (filter === 'accessory') return eq.slot === 'accessory1' || eq.slot === 'accessory2';
        return true;
    });

    const handleEquip = (itemId: string) => {
        const result = gsm.equipItem(itemId);
        if (result.success) {
            setSelectedSlot(null);
        }
    };

    const handleUnequip = (slot: EquipmentSlot) => {
        gsm.unequipItem(slot);
    };

    const getSlotIcon = (slot: EquipmentSlot): string => {
        switch (slot) {
            case 'weapon': return '⚔️';
            case 'armor': return '🛡️';
            case 'accessory1': return '💍';
            case 'accessory2': return '📿';
            default: return '❓';
        }
    };

    const getSlotName = (slot: EquipmentSlot): string => {
        const names = {
            weapon: { ko: '무기', en: 'Weapon' },
            armor: { ko: '방어구', en: 'Armor' },
            accessory1: { ko: '악세서리 1', en: 'Accessory 1' },
            accessory2: { ko: '악세서리 2', en: 'Accessory 2' }
        };
        return names[slot][lang];
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return 'text-gray-400 border-gray-600';
            case 'Uncommon': return 'text-green-400 border-green-600';
            case 'Rare': return 'text-blue-400 border-blue-600';
            case 'Legendary': return 'text-yellow-400 border-yellow-600';
            default: return 'text-gray-400 border-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-4 border-b-2 border-indigo-500 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">⚔️</span>
                        {lang === 'ko' ? '장비' : 'Equipment'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-400 text-3xl leading-none transition"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
                    {/* Left: Equipped Items & Stats */}
                    <div className="lg:w-1/2 p-6 border-r-2 border-slate-700 overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span>👤</span>
                            {lang === 'ko' ? '장착 중' : 'Equipped'}
                        </h3>

                        {/* Equipment Slots */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {(['weapon', 'armor', 'accessory1', 'accessory2'] as EquipmentSlot[]).map(slot => {
                                const itemId = equippedItems[slot];
                                const equipment = itemId ? EQUIPMENT_DATA.find(e => e.id === itemId) : null;

                                return (
                                    <div
                                        key={slot}
                                        className={`bg-slate-800 border-2 rounded-xl p-4 cursor-pointer transition ${selectedSlot === slot
                                                ? 'border-indigo-500 bg-indigo-900/30'
                                                : 'border-slate-600 hover:border-slate-500'
                                            }`}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{getSlotIcon(slot)}</span>
                                            <span className="text-xs text-slate-400 uppercase font-bold">
                                                {getSlotName(slot)}
                                            </span>
                                        </div>

                                        {equipment ? (
                                            <div>
                                                <div className={`text-sm font-bold mb-1 ${getRarityColor(equipment.rarity)}`}>
                                                    {lang === 'ko' && equipment.nameKo ? equipment.nameKo : equipment.name}
                                                </div>
                                                <div className="text-xs text-slate-400 mb-2">
                                                    {lang === 'ko' && equipment.descriptionKo ? equipment.descriptionKo : equipment.description}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUnequip(slot);
                                                    }}
                                                    className="text-xs text-red-400 hover:text-red-300 transition"
                                                >
                                                    {lang === 'ko' ? '해제' : 'Unequip'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-slate-500 text-sm italic">
                                                {lang === 'ko' ? '비어있음' : 'Empty'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total Stats */}
                        <div className="bg-slate-800 border-2 border-green-600 rounded-xl p-4">
                            <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                                <span>📊</span>
                                {lang === 'ko' ? '장비 보너스' : 'Equipment Bonuses'}
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(equippedStats).map(([stat, value]) => {
                                    if (!value || value === 0) return null;
                                    const statName = lang === 'ko' ? {
                                        attack: '공격력',
                                        defense: '방어력',
                                        specialAttack: '특수 공격',
                                        skillResistance: '특수 방어',
                                        speed: '속도',
                                        maxHp: '최대 HP'
                                    }[stat] : stat;

                                    return (
                                        <div key={stat} className="flex justify-between text-green-300">
                                            <span className="capitalize">{statName}:</span>
                                            <span className="font-bold">+{value}</span>
                                        </div>
                                    );
                                })}
                                {Object.keys(equippedStats).length === 0 && (
                                    <div className="text-slate-500 italic col-span-2">
                                        {lang === 'ko' ? '장비를 착용하면 보너스가 표시됩니다' : 'Equip items to see bonuses'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Inventory */}
                    <div className="lg:w-1/2 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>🎒</span>
                                {lang === 'ko' ? '인벤토리' : 'Inventory'}
                            </h3>

                            {/* Filter */}
                            <div className="flex gap-2">
                                {(['all', 'weapon', 'armor', 'accessory'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${filter === f
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                            }`}
                                    >
                                        {lang === 'ko' ? {
                                            all: '전체',
                                            weapon: '무기',
                                            armor: '방어구',
                                            accessory: '악세서리'
                                        }[f] : f.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Equipment List */}
                        <div className="space-y-3">
                            {filteredEquipment.length === 0 && (
                                <div className="text-slate-500 text-center py-8 italic">
                                    {lang === 'ko' ? '장비가 없습니다' : 'No equipment in inventory'}
                                </div>
                            )}

                            {filteredEquipment.map(equipment => {
                                const canEquip = gsm.canEquipItem(equipment.id);
                                const isEquipped = Object.values(equippedItems).includes(equipment.id);

                                return (
                                    <div
                                        key={equipment.id}
                                        className={`bg-slate-800 border-2 rounded-xl p-4 ${getRarityColor(equipment.rarity)}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{equipment.icon}</span>
                                                <div>
                                                    <div className="font-bold">
                                                        {lang === 'ko' && equipment.nameKo ? equipment.nameKo : equipment.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        Lv.{equipment.requiredLevel} • {equipment.rarity} • x{equipment.quantity}
                                                    </div>
                                                </div>
                                            </div>

                                            {!isEquipped && canEquip.canEquip && (
                                                <button
                                                    onClick={() => handleEquip(equipment.id)}
                                                    className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-sm font-bold transition"
                                                >
                                                    {lang === 'ko' ? '장착' : 'Equip'}
                                                </button>
                                            )}

                                            {isEquipped && (
                                                <span className="text-green-400 text-sm font-bold">
                                                    {lang === 'ko' ? '착용 중' : 'Equipped'}
                                                </span>
                                            )}

                                            {!canEquip.canEquip && (
                                                <span className="text-red-400 text-xs">
                                                    {canEquip.reason}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-300 mb-2">
                                            {lang === 'ko' && equipment.descriptionKo ? equipment.descriptionKo : equipment.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(equipment.stats).map(([stat, value]) => {
                                                if (!value) return null;
                                                const statName = lang === 'ko' ? {
                                                    attack: '공격',
                                                    defense: '방어',
                                                    specialAttack: '특공',
                                                    skillResistance: '특방',
                                                    speed: '속도',
                                                    maxHp: 'HP'
                                                }[stat] : stat.substring(0, 3).toUpperCase();

                                                return (
                                                    <span
                                                        key={stat}
                                                        className={`px-2 py-1 rounded text-xs font-bold ${(value as number) > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                                            }`}
                                                    >
                                                        {statName} {(value as number) > 0 ? '+' : ''}{value}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
