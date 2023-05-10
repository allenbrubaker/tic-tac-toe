import { injectable } from 'inversify';
import { argv } from 'node:process';

export interface IConfig {
  server: boolean;
  port: number;
  url?: string;
}

@injectable()
export class Config implements IConfig {
  server: boolean;
  port: number;
  url?: string;

  constructor() {
    const args = argv.slice(2);
    if (!args.length) throw new Error('No parameters supplied for PORT and URL');
    this.server = !!argv[1].match(/server/i);
    this.port = +args.at(-1);
    if (!this.server) {
      this.url = args.at(0);
      if (!this.url.match(/http/i)) this.url = `http://` + this.url;
    }
  }
}
