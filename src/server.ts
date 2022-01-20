import { createSocket } from 'dgram';
import EventEmitter from 'events';
import { ApiClient, KakaoLinkClient } from 'node-kakaolink';
import TypedEmitter from 'typed-emitter';
import Message from './message';

type Events = {
  message: (message: Message) => void;
};

class Server extends (EventEmitter as unknown as new () => TypedEmitter<Events>) {
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
            // const test = encodeURIComponent(JSON.stringify({ event: 'sendText', data: { room: data.room, text: data.content } }));
            // this.socket.send(test, 0, test.length, remoteInfo.port, remoteInfo.address);
            break;
        }
      else this.sessionEmitter.emit(session, success, data);
    });
  }
}

export default Server;
