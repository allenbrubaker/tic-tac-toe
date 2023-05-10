import { inject, injectable } from 'inversify';
import { Board, BoardEvent, EndGameType, GameEndedEvent, GameStartedEvent, MoveEvent, Player, Symbols } from './types';
import { IEngine } from './engine';
import { ISocketService, SubscribeSocket as Subscription } from './socket-service';
import { Socket } from 'socket.io';

export interface IGame {
  subscribe(): void;
}

@injectable()
export class Game implements IGame {
  private _board: Board = null;
  private _players: string[] = [];
  private _inProgress = false;
  private _turn = 0;

  constructor(
    @inject(Symbols.engine) private _engine: IEngine,
    @inject(Symbols.socket) private _socket: ISocketService
  ) {}

  subscribe() {
    const subscription: Subscription = {
      onConnect: socket => {
        // Any players after the first two are considered read-only spectators.
        this._players.push(socket.id);
        console.log(`player ${socket.id} connected`);
        if (this._players.length === 2) {
          this.startGame();
        }
      },
      onDisconnect: socket => {
        const player = this.getPlayer(socket);
        console.log(`player ${socket.id} disconnected`);
        this._players.splice(player, 1);
        if (this._players.length < 2 && this._inProgress) {
          this.endGameEarly(player, EndGameType.disconnect);
        }
      },
      events: [
        {
          type: new MoveEvent(),
          callback: ({ position, resign }: MoveEvent, socket) => {
            const player = this.getPlayer(socket);
            if (resign) this.endGameEarly(player, EndGameType.resign);
            else this.move(this.getPlayer(socket), position);
          }
        }
      ]
    };
    this._socket.subscribe(subscription);
  }

  private startGame() {
    this.restart();
    this._turn = 0;
    const event = new GameStartedEvent();
    event.firstPlayerId = this._players[0];
    event.secondPlayerId = this._players[1];
    this._socket.emit(event);
  }

  private getPlayer(socket: Socket): number {
    return this._players.findIndex(p => p === socket.id);
  }

  private playerLabel(index: number) {
    return index === 0 ? 'first' : index === 1 ? 'second' : '';
  }

  private move(player: number, position: number) {
    console.log('player moved', { player, position, turn: this._turn });
    if (player >= 2) {
      console.info('ignoring spectator');
      return;
    } // Ignore spectators.
    if (player !== this._turn) {
      console.info(`ignoring player ${player} due to moving out of turn`);
      return;
    } // Ignore player if it's not their turn.

    try {
      this._engine.move(this._board, player === 0 ? Player.X : Player.O, position);
      this._turn = (this._turn + 1) % 2;
      const winner = this._engine.checkWinner(this._board, this._engine.posToIndex(position));
      this.emitBoardEvent(this._board);
      if (winner) this.endGameByWin(winner);
    } catch (error) {
      console.error(error.message);
    }
  }

  private emitBoardEvent(board: Board) {
    const event = new BoardEvent();
    event.board = board;
    this._socket.emit(event);
  }

  private endGameByWin(winner?: Player) {
    if (!winner) return;
    const event = new GameEndedEvent();
    event.text =
      winner === Player.Tie ? 'Game is tied.' : `Game won by ${winner === Player.X ? 'first' : 'second'} player.`;
    this._socket.emit(event);
    this._inProgress = false;
    this._turn = 0;
  }

  private endGameEarly(lostPlayer: number, type: EndGameType) {
    const winner = (lostPlayer + 1) % 2;
    const event = new GameEndedEvent();
    if (type === EndGameType.disconnect) {
      event.text = `Game won by ${this.playerLabel(winner)} player since ${this.playerLabel(
        lostPlayer
      )} player disconnected.`;
    } else if (type === EndGameType.resign) {
      event.text = `Game won by ${this.playerLabel(winner)} player due to resignation.`;
    }
    this._socket.emit(event);
    this._inProgress = false;
    this._turn = 0;
  }

  private restart() {
    this._board = this._engine.create();
    this._inProgress = true;
  }
}
