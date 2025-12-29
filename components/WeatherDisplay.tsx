import React from 'react';
import { Weather, WEATHER_EFFECTS } from '../domain/statusEffects';

interface WeatherDisplayProps {
    weather: Weather | null;
    className?: string;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, className = '' }) => {
    if (!weather || weather.type === 'clear') return null;

    const weatherData = WEATHER_EFFECTS[weather.type];

    return (
        <div className={`flex items-center gap-2 bg-slate-800/80 border-2 border-slate-600 rounded-lg px-3 py-2 ${className}`}>
            <span className="text-2xl">{weatherData.icon}</span>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{weatherData.name}</span>
                {weather.duration > 0 && (
                    <span className="text-xs text-slate-400">{weather.duration} turns</span>
                )}
            </div>
        </div>
    );
};

interface WeatherIndicatorProps {
    weather: Weather | null;
    size?: 'small' | 'medium';
}

export const WeatherIndicator: React.FC<WeatherIndicatorProps> = ({ weather, size = 'small' }) => {
    if (!weather || weather.type === 'clear') return null;

    const weatherData = WEATHER_EFFECTS[weather.type];

    const sizeClasses = {
        small: 'w-8 h-8 text-base',
        medium: 'w-10 h-10 text-lg'
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full bg-slate-800/90 border-2 border-slate-500 flex items-center justify-center relative`}
            title={`${weatherData.name}${weather.duration > 0 ? ` (${weather.duration} turns)` : ''}`}
        >
            <span>{weatherData.icon}</span>
            {weather.duration > 0 && (
                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    {weather.duration}
                </span>
            )}
        </div>
    );
};
