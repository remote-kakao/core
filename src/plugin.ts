import { Message, Server } from '.';
import { rkPluginLog } from './logger';

abstract class RKPlugin {
  private server: Server;
  options: Record<string, any> | undefined;
  public log: (text: any) => void;

  constructor(server: Server, options?: Record<string, any>) {
    this.server = server;
    this.options = options;
    this.log = (text: any) => {
      rkPluginLog(this.constructor.name, text);
    };
  }

  extendServerClass?(server: Server) {
    return server;
  }
  extendMessageClass?(message: Message): Promise<Message> | Message {
    return message;
  }

  onReady?(port: number): Promise<void> | void {}
  onMessage?(message: Message): Promise<void> | void {}
}

export default RKPlugin;
