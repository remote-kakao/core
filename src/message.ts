import { randomUUID } from 'crypto';
import { RemoteInfo, Socket } from 'dgram';
import { KakaoLinkClient } from 'node-kakaolink';

class Message {
  private socket: Socket;
  private sessionEmitter: any;
  public remoteInfo: RemoteInfo;
  public room: string;
  public content: string;
  public sender: { name: string; getProfileImage(): string };
  public isGroupChat: boolean;

  constructor(
    data: Record<string, any>,
    sessionEmitter: any,
    socket: Socket,
    remoteInfo: RemoteInfo,
  ) {
    this.socket = socket;
    this.sessionEmitter = sessionEmitter;
    this.remoteInfo = remoteInfo;
    this.room = data.room;
    this.content = data.content;
    this.sender = {
      name: data.sender,
      getProfileImage: () => data.profileImage,
    };
    this.isGroupChat = data.isGroupChat;
  }

  public async reply(
    text: string,
    room: string = this.room,
    address: string = this.remoteInfo.address,
    port = this.remoteInfo.port,
    timeout: number = 60
  ): Promise<Record<string, any>> {
    return new Promise((res, rej) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({ event: 'sendText', data: { room, text }, session })
      );

      const handler = (success: boolean, data?: Record<string, any>) => {
        if (!success) rej();
        else res(data === undefined ? { success } : { success, data });

        this.sessionEmitter.off(session, handler);
      };

      this.sessionEmitter.on(session, handler);
      this.socket.send(data, 0, data.length, port, address);

      setTimeout(() => rej(), 1000 * timeout);
    });
  }
}

export default Message;
