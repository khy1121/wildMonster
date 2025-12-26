
import Phaser from 'phaser';
import { GameEvent } from '../domain/types';

export class EventBus extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }

  emitEvent(event: GameEvent) {
    this.emit(event.type, event);
  }

  onEvent(type: GameEvent['type'], callback: (event: any) => void) {
    this.on(type, callback);
  }
}

export const gameEvents = new EventBus();
