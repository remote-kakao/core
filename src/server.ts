import { createSocket } from 'dgram';
import EventEmitter from 'eventemitter3';
import { ApiClient, KakaoLinkClient } from 'node-kakaolink';
import Message from './message';

declare interface Server {
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

  public async start(port = 3000, kakaoLinkConfig?: { email: string; password: string; key: string; host: string }) {
    this.port = port;
    this.socket.bind(this.port);

    if (this.kakaoLink && kakaoLinkConfig) {
      const api = await ApiClient.create(kakaoLinkConfig.key, kakaoLinkConfig.host);
      const loginRes = await api.login({
        email: kakaoLinkConfig.email,
        password: kakaoLinkConfig.password,
        keeplogin: true,
      });
      if (!loginRes.success) throw new Error('카카오링크 로그인을 실패했습니다!');

      this.kakaoLink.login(loginRes.result);
    }

    this.socket.on('message', (msg, remoteInfo) => {
      const { event, session, success, data } = JSON.parse(msg.toString());

      if (event && !session)
        switch (event) {
          case 'chat':
            const message = new Message(data, this.sessionEmitter, this.socket, remoteInfo, this.kakaoLink);
            this.emit('message', message);
            break;
        }
      else this.sessionEmitter.emit(session, success, data);
    });
  }
}

export default Server;
