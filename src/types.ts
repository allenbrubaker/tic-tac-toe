export const Symbols = {
  app: Symbol.for('App'),
  config: Symbol.for('Config'),
  utils: Symbol.for('Utils'),
  socket: Symbol.for('Socket'),
  game: Symbol.for('Game'),
  engine: Symbol.for('Engine'),
  clientApp: Symbol.for('ClientApp')
};

export interface IEvent {}

export class BoardEvent implements IEvent {
  board: Board;
}

export class MoveEvent implements IEvent {
  position: number;
  resign: boolean;
}

export class GameStartedEvent implements IEvent {
  firstPlayerId: string;
  secondPlayerId: string;
}

export class GameEndedEvent implements IEvent {
  text: string;
}

export type Board = Player[][];

export enum Player {
  X = 'x',
  O = 'o',
  Tie = 'all',
  None = '.'
}

export class InvalidBoardError extends Error {
  constructor(msg?: string) {
    super(`Board Error: ${msg}`);
  }
}

export class SocketError extends Error {
  constructor(msg?: string) {
    super(`Socket Error: ${msg}`);
  }
}

export enum EndGameType {
  disconnect = 2,
  resign = 3, 
}
