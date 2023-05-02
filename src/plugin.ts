import { Message, UDPServer, rkPluginLog } from '.';
import { Config } from './types';

export abstract class RKPlugin {
  server: UDPServer;
  config?: Config;
  log: (text: any) => void;

  constructor(server: UDPServer, config?: Config) {
    this.server = server;
    this.config = config;
    this.log = (text: any) => {
      rkPluginLog(this.constructor.name, text.toString());
    };
  }

  extendServerClass?(server: UDPServer): Promise<UDPServer> | UDPServer {
    return server;
  }
  extendMessageClass?(message: Message): Promise<Message> | Message {
    return message;
  }

  onReady?(port: number): Promise<void> | void {}
  onMessage?(message: Message): Promise<void> | void {}
}
