import { TutorialSequence, TUTORIAL_SEQUENCES } from '../data/tutorials';

export interface TutorialProgress {
    completedSequences: string[];
    currentSequence: string | null;
    currentStep: number;
    firstTimeFlags: {
        gameStarted: boolean;
        firstBattle: boolean;
        firstCapture: boolean;
        firstEvolution: boolean;
        shopVisited: boolean;
        equipmentUsed: boolean;
    };
}

export class TutorialManager {
    private progress: TutorialProgress;
    private listeners: ((progress: TutorialProgress) => void)[] = [];

    constructor() {
        this.progress = this.loadProgress();
    }

    private loadProgress(): TutorialProgress {
        try {
            const saved = localStorage.getItem('wildMonster_tutorialProgress');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load tutorial progress:', error);
        }

        return {
            completedSequences: [],
            currentSequence: null,
            currentStep: 0,
            firstTimeFlags: {
                gameStarted: false,
                firstBattle: false,
                firstCapture: false,
                firstEvolution: false,
                shopVisited: false,
                equipmentUsed: false
            }
        };
    }

    private saveProgress() {
        try {
            localStorage.setItem('wildMonster_tutorialProgress', JSON.stringify(this.progress));
            this.notifyListeners();
        } catch (error) {
            console.error('Failed to save tutorial progress:', error);
        }
    }

    subscribe(listener: (progress: TutorialProgress) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.progress));
    }

    getProgress(): TutorialProgress {
        return { ...this.progress };
    }

    startSequence(sequenceId: string) {
        const sequence = TUTORIAL_SEQUENCES.find(s => s.id === sequenceId);
        if (!sequence) {
            console.error('Tutorial sequence not found:', sequenceId);
            return;
        }

        this.progress.currentSequence = sequenceId;
        this.progress.currentStep = 0;
        this.saveProgress();
    }

    nextStep() {
        if (!this.progress.currentSequence) return;

        const sequence = TUTORIAL_SEQUENCES.find(s => s.id === this.progress.currentSequence);
        if (!sequence) return;

        if (this.progress.currentStep < sequence.steps.length - 1) {
            this.progress.currentStep++;
            this.saveProgress();
        } else {
            this.completeSequence();
        }
    }

    previousStep() {
        if (!this.progress.currentSequence) return;

        if (this.progress.currentStep > 0) {
            this.progress.currentStep--;
            this.saveProgress();
        }
    }

    completeSequence() {
        if (!this.progress.currentSequence) return;

        if (!this.progress.completedSequences.includes(this.progress.currentSequence)) {
            this.progress.completedSequences.push(this.progress.currentSequence);
        }

        this.progress.currentSequence = null;
        this.progress.currentStep = 0;
        this.saveProgress();
    }

    skipSequence() {
        this.completeSequence();
    }

    setFirstTimeFlag(flag: keyof TutorialProgress['firstTimeFlags'], value: boolean) {
        this.progress.firstTimeFlags[flag] = value;
        this.saveProgress();
    }

    shouldShowTutorial(sequenceId: string): boolean {
        // Don't show if already completed
        if (this.progress.completedSequences.includes(sequenceId)) {
            return false;
        }

        const sequence = TUTORIAL_SEQUENCES.find(s => s.id === sequenceId);
        if (!sequence) return false;

        // Check trigger condition
        if (sequence.triggerCondition === 'firstTime') {
            return !this.progress.firstTimeFlags.gameStarted;
        }

        return true;
    }

    getCurrentSequence(): TutorialSequence | null {
        if (!this.progress.currentSequence) return null;
        return TUTORIAL_SEQUENCES.find(s => s.id === this.progress.currentSequence) || null;
    }

    getCurrentStep() {
        const sequence = this.getCurrentSequence();
        if (!sequence) return null;
        return sequence.steps[this.progress.currentStep] || null;
    }

    resetProgress() {
        this.progress = {
            completedSequences: [],
            currentSequence: null,
            currentStep: 0,
            firstTimeFlags: {
                gameStarted: false,
                firstBattle: false,
                firstCapture: false,
                firstEvolution: false,
                shopVisited: false,
                equipmentUsed: false
            }
        };
        this.saveProgress();
    }

    // Auto-trigger tutorials based on game events
    checkTriggers(event: string) {
        switch (event) {
            case 'game_started':
                if (!this.progress.firstTimeFlags.gameStarted) {
                    this.setFirstTimeFlag('gameStarted', true);
                    if (this.shouldShowTutorial('first_time')) {
                        this.startSequence('first_time');
                    }
                }
                break;

            case 'first_battle':
                if (!this.progress.firstTimeFlags.firstBattle) {
                    this.setFirstTimeFlag('firstBattle', true);
                    if (this.shouldShowTutorial('battle_basics')) {
                        this.startSequence('battle_basics');
                    }
                }
                break;

            case 'hud_shown':
                if (this.shouldShowTutorial('hud_basics')) {
                    this.startSequence('hud_basics');
                }
                break;
        }
    }
}

// Singleton instance
export const tutorialManager = new TutorialManager();
