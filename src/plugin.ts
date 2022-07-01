import { Message, Server } from '.';
import { rkPluginLog } from './logger';

class RKPlugin {
  server: Server;
  static log = (text: any) => rkPluginLog(this.name, text);

  constructor(server: Server) {
    this.server = server;
  }

  onReady?(port: number): void;
  onMessage?(message: Message): void;
}

export default RKPlugin;
