import { createServer } from 'http';
import { inject, injectable } from 'inversify';
import { BoardEvent, GameEndedEvent, GameStartedEvent, MoveEvent, Symbols } from './types';
import { IConfig } from './config';
import { io, Socket } from 'socket.io-client';
import { createInterface } from 'readline';

const _readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

export interface IClientApp {
  run(): Promise<void>;
}

export type HttpServer = ReturnType<typeof createServer>;

@injectable()
export class ClientApp implements IClientApp {
  constructor(@inject(Symbols.config) private _config: IConfig) {}

  private subscribe(): Socket {
    const socket = io(`${this._config.url}:${this._config.port}`);
    socket.on('connect', () => {
      console.log(`connected to ${this._config.url} ${this._config.port}`);
    });
    socket.on('disconnect', () => {
      console.log(`disconnected`);
    });
    socket.on('connect_error', err => {
      console.log(`connect_error due to ${err.message}`);
    });
    socket.on(GameStartedEvent.name, (ev: GameStartedEvent) => {
      console.log(`Game started. You are the ${socket.id === ev.firstPlayerId ? 'first' : 'second'} player.`);
      this.getAndSendMove(socket);
    });
    socket.on(GameEndedEvent.name, (ev: GameEndedEvent) => {
      console.log();
      console.log(ev.text);
      socket.disconnect();
      _readline.close();
    });
    socket.on(BoardEvent.name, ({ board }: BoardEvent) => {
      console.log();
      board.forEach(row => console.log(row.join('')));
      console.log();
      this.getAndSendMove(socket);
    });
    return socket;
  }

  async run() {
    this.subscribe();
  }

  private async getAndSendMove(socket: Socket) {
    while (true) {
      const moveEvent = await this.getMove();
      if (moveEvent) socket.emit(MoveEvent.name, moveEvent);
    }
  }

  private question = (question: string): Promise<string> => {
    return new Promise(resolve => _readline.question(question, resolve));
  };

  private async getMove(): Promise<MoveEvent | null> {
    try {
      const _move = await this.question(`Move from 1-9 or (r)esign: `);
      const move = _move?.trim().match(/^[1-9r]$/);
      if (!move) return null;
      const event = new MoveEvent();
      if (move[0] === 'r') event.resign = true;
      else event.position = Number(move);
      return event;
    } catch (err) {
      return null;
    }
  }
}
