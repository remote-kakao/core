import EventEmitter from 'node:events';
import type TypedEmitter from 'typed-emitter';
import { createSocket, type Socket, type SocketType } from 'node:dgram';
import type { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import { Events, RKError } from '.';
import { Message } from '../message';

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
      const { event, id, data } = JSON.parse(msg.toString('utf-8'));

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
    info: AddressInfo,
    roomId: string,
    text: string,
    timeout: number = 60000,
  ) {
    return new Promise<boolean>((res, rej) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({ event: 'send_text', session, data: { roomId, text } }),
      );

      const t = setTimeout(() => rej(RKError.TIMEOUT), timeout);

      const handler = (success: boolean) => {
        if (!success) rej(RKError.UNKNOWN);
        else res(success);
        clearTimeout(t);
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(data, 0, data.length, info.port, info.address);
    });
  }
}
