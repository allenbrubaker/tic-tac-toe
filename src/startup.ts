import 'reflect-metadata'; // Prerequisite for inversify.

import { BindingScopeEnum, Container } from 'inversify';
import { App, IApp } from './app';
import { Symbols } from './types';
import { Config, IConfig } from './config';
import { IUtils, Utils } from './utils';
import { ISocketService, SocketService } from './socket-service';
import { Game, IGame } from './game';
import { Engine, IEngine } from './engine';
import { ClientApp, IClientApp } from './client-app';

export class Startup {
  register(): Container {
    const container = new Container({ defaultScope: BindingScopeEnum.Singleton });
    container.bind<IApp>(Symbols.app).to(App);
    container.bind<IClientApp>(Symbols.clientApp).to(ClientApp);
    container.bind<IConfig>(Symbols.config).to(Config);
    container.bind<IUtils>(Symbols.utils).to(Utils);
    container.bind<ISocketService>(Symbols.socket).to(SocketService);
    container.bind<IEngine>(Symbols.engine).to(Engine);
    container.bind<IGame>(Symbols.game).to(Game);
    return container;
  }

  async server(container: Container): Promise<void> {
    const app = container.get<IApp>(Symbols.app);
    app.run();
  }

  async client(container: Container): Promise<void> {
    const clientApp = container.get<IClientApp>(Symbols.clientApp);
    await clientApp.run();
  }
}
