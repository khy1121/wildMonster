
import { Character } from '../domain/types';

export const CHARACTER_DATA: Record<string, Character> = {
    leo: {
        id: 'leo',
        name: 'Leo',
        role: 'Warrior',
        description: 'A brave adventurer with a strong sense of justice. Prefers direct combat.',
        image: 'characters/leo.png',
        startingBonus: { attack: 2 }
    },
    ken: {
        id: 'ken',
        name: 'Ken',
        role: 'Scholar',
        description: 'An intellectual researcher who studies Wilder biology. Specialized in tactical analysis.',
        image: 'characters/ken.png',
        startingBonus: { defense: 2 }
    },
    elara: {
        id: 'elara',
        name: 'Elara',
        role: 'Mystic',
        description: 'A nature-loving mystic who communicates with spirits. Skilled in healing and support.',
        image: 'characters/elara.png',
        startingBonus: { hp: 10, maxHp: 10 }
    },
    zoe: {
        id: 'zoe',
        name: 'Zoe',
        role: 'Ranger',
        description: 'An agile ranger who thrives in the wild. Focuses on speed and precision.',
        image: 'characters/zoe.png',
        startingBonus: { speed: 2 }
    }
};
