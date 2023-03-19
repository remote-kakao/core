import { randomUUID } from 'crypto';
import { createSocket, RemoteInfo, type Socket, type SocketType } from 'dgram';
import EventEmitter from 'events';
import Message from 'message';
import type TypedEmitter from 'typed-emitter';
import type { Events } from './index';

export class UDPServer extends (EventEmitter as new () => TypedEmitter<
  Events<UDPServer>
>) {
  #socket: Socket;
  #sessionEmitter: TypedEmitter<{
    [event: string]: (success: boolean) => void | Promise<void>;
  }>;

  constructor(socketType: SocketType = 'udp4') {
    super();
    this.#socket = createSocket(socketType);
    this.#sessionEmitter = new EventEmitter() as TypedEmitter<{
      [event: string]: (success: boolean) => void | Promise<void>;
    }>;
  }

  async start(port: number = 3000, address?: string) {
    this.#socket.on('message', (msg, remoteInfo) => {
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      const { event, id, data }: { event: string; id: string; data: any } =
        JSON.parse(msg.toString('utf-8'));

      if (event.startsWith('reply:'))
        return this.#sessionEmitter.emit(
          event.slice('reply:'.length),
          data.success,
        );
      switch (event) {
        case 'chat':
          this.emit('chat', new Message(this, remoteInfo, data));
          break;
      }
    });

    await new Promise<void>((res) =>
      this.#socket.bind(port, address, () => res()),
    );

    this.emit('ready', port);
  }

  async sendText(
    remoteInfo: RemoteInfo,
    room: string,
    text: string,
    timeout: number = 60000,
  ) {
    return new Promise<{ success: boolean }>((res, rej) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({ event: 'send_text', session, data: { room, text } }),
      );

      const handler = (success: boolean) => {
        if (!success) rej();
        else res({ success });
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(
        data,
        0,
        data.length,
        remoteInfo.port,
        remoteInfo.address,
      );

      setTimeout(() => rej(), timeout);
    });
  }
}
