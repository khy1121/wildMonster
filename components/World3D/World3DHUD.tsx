import React from 'react';

type OverlayType = 'SKILLS' | 'SHOP' | 'QUESTS' | 'FACTIONS' | 'MENU' | 'INVENTORY' | 'INCUBATOR' | 'ACHIEVEMENTS' | 'EXPEDITIONS' | 'WORLDMAP' | 'ENHANCED_QUESTS' | 'EQUIPMENT' | 'SAVES';

interface World3DHUDProps {
    playerPos: { x: number; z: number };
    partnerPos?: { x: number; z: number };
    buildings?: Array<{ x: number; z: number; radius: number }>;
    onOpenOverlay?: (overlay: OverlayType) => void;
    onClose?: () => void;
}

export const World3DHUD: React.FC<World3DHUDProps> = ({
    playerPos,
    partnerPos,
    buildings = [],
    onOpenOverlay,
    onClose
}) => {
    const buttons = [
        { icon: '📦', label: 'Inventory', key: 'I', overlay: 'INVENTORY' as OverlayType },
        { icon: '📜', label: 'Quests', key: 'Q', overlay: 'ENHANCED_QUESTS' as OverlayType },
        { icon: '🗺️', label: 'Map', key: 'M', overlay: 'WORLDMAP' as OverlayType },
        { icon: '⚔️', label: 'Equipment', key: 'C', overlay: 'EQUIPMENT' as OverlayType },
        { icon: '✨', label: 'Skills', key: 'K', overlay: 'SKILLS' as OverlayType },
        { icon: '🏰', label: 'Factions', key: 'F', overlay: 'FACTIONS' as OverlayType },
        { icon: '🏪', label: 'Shop', key: 'B', overlay: 'SHOP' as OverlayType },
        { icon: '🏆', label: 'Achievements', key: 'P', overlay: 'ACHIEVEMENTS' as OverlayType },
        { icon: '🧭', label: 'Expeditions', key: 'E', overlay: 'EXPEDITIONS' as OverlayType },
        { icon: '🥚', label: 'Incubator', key: 'O', overlay: 'INCUBATOR' as OverlayType },
    ];

    return (
        <>
            {/* Top-left: Controls and Position */}
            <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    3D World
                </h3>
                <div className="text-sm space-y-1">
                    <p className="flex items-center gap-2">
                        <span className="text-yellow-400">🎮</span>
                        <span className="font-mono">WASD</span> - Move
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="text-blue-400">🖱️</span>
                        <span className="font-mono">Drag</span> - Rotate
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="text-green-400">🔍</span>
                        <span className="font-mono">Scroll</span> - Zoom
                    </p>
                    <p className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-600">
                        <span className="text-purple-400">📍</span>
                        Position: <span className="font-mono">{playerPos.x.toFixed(1)}, {playerPos.z.toFixed(1)}</span>
                    </p>
                </div>
            </div>

            {/* Minimap */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 p-3 rounded-lg backdrop-blur-sm">
                <h4 className="text-white text-xs font-bold mb-2 text-center">Minimap</h4>
                <div className="relative w-48 h-48 bg-gradient-to-br from-green-900 to-green-700 rounded border-2 border-gray-600">
                    {/* Grid lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-30">
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="1" />
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="1" />
                        <circle cx="50%" cy="50%" r="20%" fill="none" stroke="white" strokeWidth="1" />
                        <circle cx="50%" cy="50%" r="40%" fill="none" stroke="white" strokeWidth="1" />
                    </svg>

                    {/* Buildings */}
                    {buildings.map((building, idx) => {
                        const mapX = ((building.x + 100) / 200) * 100;
                        const mapZ = ((building.z + 100) / 200) * 100;
                        return (
                            <div
                                key={idx}
                                className="absolute w-2 h-2 bg-gray-400 rounded-sm transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${mapX}%`, top: `${mapZ}%` }}
                            />
                        );
                    })}

                    {/* Partner */}
                    {partnerPos && (
                        <div
                            className="absolute w-3 h-3 bg-pink-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                            style={{
                                left: `${((partnerPos.x + 100) / 200) * 100}%`,
                                top: `${((partnerPos.z + 100) / 200) * 100}%`
                            }}
                        />
                    )}

                    {/* Player */}
                    <div
                        className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg"
                        style={{
                            left: `${((playerPos.x + 100) / 200) * 100}%`,
                            top: `${((playerPos.z + 100) / 200) * 100}%`
                        }}
                    />
                </div>
            </div>

            {/* Top-right: Exit Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition shadow-lg"
                >
                    Exit 3D Mode
                </button>
            )}

            {/* Bottom-right: Quick Access Menu */}
            {onOpenOverlay && (
                <div className="absolute bottom-4 right-4 bg-black/80 p-3 rounded-lg backdrop-blur-sm">
                    <h4 className="text-white text-xs font-bold mb-2 text-center">Quick Access</h4>
                    <div className="grid grid-cols-5 gap-2">
                        {buttons.map((btn) => (
                            <button
                                key={btn.overlay}
                                onClick={() => onOpenOverlay(btn.overlay)}
                                className="group relative bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white w-12 h-12 rounded-lg transition shadow-lg flex items-center justify-center text-xl"
                                title={`${btn.label} (${btn.key})`}
                            >
                                {btn.icon}
                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                                    {btn.label} ({btn.key})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom-left: Info */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-md backdrop-blur-sm">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                    <span className="text-xl">🎉</span>
                    3D MMORPG World
                </h4>
                <p className="text-sm text-gray-300">
                    디지몬 마스터즈 스타일의 3D 오픈월드입니다.
                    <br />
                    키보드 단축키로 메뉴를 열 수 있습니다!
                </p>
            </div>
        </>
    );
};
