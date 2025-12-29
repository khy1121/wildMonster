import React, { useState, useEffect } from 'react';
import { TutorialStep } from '../data/tutorials';

interface TutorialOverlayProps {
    step: TutorialStep;
    currentStep: number;
    totalSteps: number;
    language: 'en' | 'ko';
    onNext: () => void;
    onSkip: () => void;
    onPrevious?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
    step,
    currentStep,
    totalSteps,
    language,
    onNext,
    onSkip,
    onPrevious
}) => {
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (step.targetElement) {
            const element = document.querySelector(step.targetElement) as HTMLElement;
            if (element) {
                setHighlightedElement(element);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setHighlightedElement(null);
        }
    }, [step.targetElement]);

    const getPositionClasses = () => {
        switch (step.position) {
            case 'top':
                return 'top-20 left-1/2 -translate-x-1/2';
            case 'bottom':
                return 'bottom-20 left-1/2 -translate-x-1/2';
            case 'left':
                return 'left-20 top-1/2 -translate-y-1/2';
            case 'right':
                return 'right-20 top-1/2 -translate-y-1/2';
            case 'center':
            default:
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 z-[9998]" onClick={onSkip} />

            {/* Highlight spotlight */}
            {highlightedElement && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: highlightedElement.getBoundingClientRect().top - 8,
                        left: highlightedElement.getBoundingClientRect().left - 8,
                        width: highlightedElement.getBoundingClientRect().width + 16,
                        height: highlightedElement.getBoundingClientRect().height + 16,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                        border: '3px solid #60a5fa',
                        borderRadius: '12px',
                        animation: 'pulse 2s infinite'
                    }}
                />
            )}

            {/* Tutorial Card */}
            <div className={`fixed z-[10000] ${getPositionClasses()} w-full max-w-md`}>
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-400 rounded-2xl shadow-2xl overflow-hidden mx-4">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {language === 'ko' ? step.titleKo : step.title}
                            </h3>
                            <p className="text-xs text-indigo-200">
                                {language === 'ko' ? '튜토리얼' : 'Tutorial'} {currentStep + 1} / {totalSteps}
                            </p>
                        </div>
                        <button
                            onClick={onSkip}
                            className="text-white hover:text-red-300 transition"
                            title={language === 'ko' ? '건너뛰기' : 'Skip'}
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step.image && (
                            <img
                                src={step.image}
                                alt={step.title}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                        )}

                        <p className="text-white text-base leading-relaxed mb-6">
                            {language === 'ko' ? step.descriptionKo : step.description}
                        </p>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                            />
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            {currentStep > 0 && onPrevious && (
                                <button
                                    onClick={onPrevious}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-bold transition flex-1"
                                >
                                    {language === 'ko' ? '이전' : 'Previous'}
                                </button>
                            )}

                            <button
                                onClick={onNext}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white font-bold transition flex-1 shadow-lg"
                            >
                                {currentStep === totalSteps - 1
                                    ? (language === 'ko' ? '완료' : 'Finish')
                                    : (language === 'ko' ? '다음' : 'Next')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
        </>
    );
};
