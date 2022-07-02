import { createSocket } from 'dgram';
import EventEmitter from 'eventemitter3';
import { ApiClient, KakaoLinkClient } from 'node-kakaolink';
import { rkColor, rkLog } from './logger';
import Message from './message';
import RKPlugin from './plugin';

declare interface Server {
  on(event: 'ready', listener: (port: number) => void): this;
  on(event: 'message', listener: (message: Message) => void): this;
  on(event: string, listener: Function): this;
}

class Server extends EventEmitter {
  public socket = createSocket('udp4');
  private port = 3000;
  private sessionEmitter;
  private plugins: RKPlugin[] = [];

  constructor() {
    super();
    this.sessionEmitter = new EventEmitter();
  }

  public usePlugin(
    Plugin: new (
      server: Server,
      options?: Record<string, any>,
      ...args: any[]
    ) => RKPlugin,
    options?: Record<string, any>
  ) {
    const plugin = new Plugin(this, options);

    if (plugin.extendServerClass) plugin.extendServerClass(this);
    if (plugin.onReady) this.on('ready', plugin.onReady);
    if (plugin.onMessage)
      this.on('message', (message: Message) => {
        if (plugin.extendMessageClass) plugin.extendMessageClass(message);
        if (plugin.onMessage) plugin.onMessage(message);
      });

    this.plugins.push(plugin);

    rkLog(`Plugin ${rkColor(plugin.constructor.name)} enabled!`);
  }

  public async start(port = 3000) {
    this.port = port;
    this.socket.bind(this.port);

    this.socket.on('message', (msg, remoteInfo) => {
      const { event, session, success, data } = JSON.parse(msg.toString());

      if (event && !session)
        switch (event) {
          case 'chat':
            const message = new Message(
              data,
              this.sessionEmitter,
              this.socket,
              remoteInfo,
            );

            this.plugins.forEach((plugin) => {
              if (plugin.extendMessageClass) plugin.extendMessageClass(message);
            });

            this.emit('message', message);
            break;
        }
      else this.sessionEmitter.emit(session, success, data);
    });

    rkLog(`${rkColor('remote-kakao')} listening on port ${rkColor(port)}!\n`);

    this.emit('ready', this.port);
  }
}

export default Server;
