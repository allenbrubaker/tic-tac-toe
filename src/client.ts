import { Startup } from './startup';
const startup = new Startup();
const container = startup.register();
startup.client(container);
