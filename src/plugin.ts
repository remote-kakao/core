import { Message, Server, rkPluginLog } from '.';

export abstract class RKPlugin {
  public server: Server;
  // rome-ignore lint/suspicious/noExplicitAny:
  public config?: Record<string, any>;
  // rome-ignore lint/suspicious/noExplicitAny:
  public log: (text: any) => void;

  // rome-ignore lint/suspicious/noExplicitAny:
  constructor(server: Server, config?: Record<string, any>) {
    this.server = server;
    this.config = config;
    // rome-ignore lint/suspicious/noExplicitAny:
    this.log = (text: any) => {
      rkPluginLog(this.constructor.name, text.toString());
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
