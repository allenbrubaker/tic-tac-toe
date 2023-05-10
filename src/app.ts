import { inject, injectable } from 'inversify';
import { Symbols } from './types';
import { IConfig } from './config';
import { IGame } from './game';
import { ISocketService } from './socket-service';

export interface IApp {
  run(): void;
}

@injectable()
export class App implements IApp {
  constructor(
    @inject(Symbols.config) private _config: IConfig,
    @inject(Symbols.game) private _game: IGame,
    @inject(Symbols.socket) private _socket: ISocketService
  ) {}

  run(): void {
    this._socket.connect(this._config.port);
    this._game.subscribe();
  }
}
