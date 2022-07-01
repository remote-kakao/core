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
  private kakaoLink?: KakaoLinkClient;

  constructor(config: { useKakaoLink?: boolean } = { useKakaoLink: false }) {
    super();
    if (config.useKakaoLink) this.kakaoLink = new KakaoLinkClient();
    this.sessionEmitter = new EventEmitter();
  }

  public usePlugin(Plugin: typeof RKPlugin) {
    const plugin = new Plugin(this);

    if (plugin.onReady) this.on('ready', plugin.onReady);
    if (plugin.onMessage) this.on('message', plugin.onMessage);

    rkLog(`Plugin ${rkColor(plugin.constructor.name)} enabled!`);
  }

  public async start(
    port = 3000,
    kakaoLinkConfig?: {
      email: string;
      password: string;
      key: string;
      host: string;
    }
  ) {
    this.port = port;
    this.socket.bind(this.port);

    if (this.kakaoLink && kakaoLinkConfig) {
      const api = await ApiClient.create(
        kakaoLinkConfig.key,
        kakaoLinkConfig.host
      );
      const loginRes = await api.login({
        email: kakaoLinkConfig.email,
        password: kakaoLinkConfig.password,
        keeplogin: true,
      });
      if (!loginRes.success)
        throw new Error('Failed login to KakaoLink server!');

      this.kakaoLink.login(loginRes.result);
    }

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
              this.kakaoLink
            );
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
