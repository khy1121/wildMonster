import React from 'react';
import { StatusEffect, STATUS_EFFECTS } from '../domain/statusEffects';

interface StatusIconProps {
    status: StatusEffect | null;
    size?: 'small' | 'medium' | 'large';
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, size = 'medium' }) => {
    if (!status) return null;

    const effectData = STATUS_EFFECTS[status.type];

    const sizeClasses = {
        small: 'w-6 h-6 text-xs',
        medium: 'w-8 h-8 text-sm',
        large: 'w-10 h-10 text-base'
    };

    const iconSize = {
        small: 'text-base',
        medium: 'text-lg',
        large: 'text-xl'
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 relative`}
            style={{
                backgroundColor: effectData.color + '40',
                borderColor: effectData.color
            }}
            title={`${effectData.name} (${status.duration > 0 ? `${status.duration} turns` : 'Permanent'})`}
        >
            <span className={iconSize[size]}>{effectData.icon}</span>
            {status.duration > 0 && (
                <span
                    className="absolute -bottom-1 -right-1 bg-slate-900 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-slate-600"
                >
                    {status.duration}
                </span>
            )}
        </div>
    );
};

interface StatusDisplayProps {
    status: StatusEffect | null;
    volatileStatus?: string[];
    className?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
    status,
    volatileStatus = [],
    className = ''
}) => {
    if (!status && volatileStatus.length === 0) return null;

    return (
        <div className={`flex gap-1 items-center ${className}`}>
            {status && <StatusIcon status={status} size="small" />}
            {volatileStatus.map((vs, idx) => (
                <div
                    key={idx}
                    className="w-5 h-5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-xs"
                    title={vs}
                >
                    ⚡
                </div>
            ))}
        </div>
    );
};
