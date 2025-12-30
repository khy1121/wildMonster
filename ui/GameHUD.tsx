
import React from 'react';

interface GameHUDProps {
    children: React.ReactNode;
}

export const GameHUD: React.FC<GameHUDProps> = ({ children }) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
            {/* Top Bar Area */}
            <div className="w-full pointer-events-auto">
                {children}
            </div>

            {/* Bottom Area (Can be used for notifications, hotbars, etc in the future) */}
            <div className="w-full flex justify-center pointer-events-auto">
                {/* Placeholder for future HUD elements */}
            </div>
        </div>
    );
};
