import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { IEvent, SocketError } from './types';
import { Observable } from 'rxjs';

type SocketHandler = (_: Socket) => void;

export type SubscribeMessage = {
  type: IEvent;
  callback: (event: IEvent, socket: Socket) => void;
};

export type SubscribeSocket = {
  onConnect?: SocketHandler;
  onDisconnect?: SocketHandler;
  events?: SubscribeMessage[];
};

export interface ISocketService {
  connect(port: number): void;
  emit(msg: IEvent): void;
  subscribe(_: SubscribeSocket): void;
}

@injectable()
export class SocketService implements ISocketService {
  constructor() {}
  private _io: Server;
  private _socket$: Observable<Socket>;
  connect(port: number) {
    if (this._io) return;
    this._io = new Server(port);
    console.log(`listening on port ${port}`);
    this._socket$ = new Observable(subscriber => {
      this._io.on('connection', socket => {
        subscriber.next(socket);
      });
    });
  }

  emit(msg: IEvent) {
    this._io.emit(msg.constructor.name, msg);
  }

  subscribe({ events, onConnect, onDisconnect }: SubscribeSocket) {
    if (!this._io) throw new SocketError('connect before subscribing to socket');
    this._socket$.subscribe(socket => {
      onConnect?.(socket);
      events?.forEach(({ type, callback }) =>
        socket.on(type.constructor.name, (event: IEvent) => callback(event, socket))
      );
      if (onDisconnect) socket.on('disconnect', () => onDisconnect(socket));
    });
  }
}
