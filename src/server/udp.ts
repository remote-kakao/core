import EventEmitter from 'node:events';
import type TypedEmitter from 'typed-emitter';
import { createSocket, type Socket, type SocketType } from 'node:dgram';
import type { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import { Events, Message, RKPlugin } from '..';
import RKError from '../error';
import { readyLog, rkColor, rkLog } from '../logger';

export class UDPServer extends (EventEmitter as new () => TypedEmitter<Events>) {
  #socket: Socket;
  #sessionEmitter: EventEmitter;
  #plugins: RKPlugin[] = [];
  serviceName?: string;

  constructor({
    socketType = 'udp4',
    serviceName,
  }: { socketType?: SocketType; serviceName?: string } = {}) {
    super();
    this.#socket = createSocket(socketType);
    this.#sessionEmitter = new EventEmitter();
    this.serviceName = serviceName;
  }

  public usePlugin<
    T extends new (
      server: UDPServer,
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      config?: Record<string, any> | undefined,
    ) => RKPlugin,
  >(
    Plugin: T,
    pluginOptions?: ConstructorParameters<T>[1],
    enableLog: boolean = true,
  ) {
    const plugin = new Plugin(this, pluginOptions);

    if (plugin.extendServerClass) plugin.extendServerClass(this);
    if (plugin.onReady) this.on('ready', plugin.onReady);
    if (plugin.onMessage)
      this.on('message', (message: Message) => {
        if (plugin.extendMessageClass) plugin.extendMessageClass(message);
        if (plugin.onMessage) plugin.onMessage(message);
      });

    this.#plugins.push(plugin);

    if (enableLog) rkLog(`Plugin ${rkColor(plugin.constructor.name)} enabled!`);

    return plugin;
  }

  async start(
    port: number = 3000,
    address?: string,
    enableLog: boolean = true,
  ) {
    this.#socket.on('message', (msg, remoteInfo) => {
      const { event, data } = JSON.parse(msg.toString('utf-8'));

      if (event.startsWith('reply:')) {
        return this.#sessionEmitter.emit(event.slice('reply:'.length), data);
      }
      switch (event) {
        case 'message':
          console.log(data);
          this.emit('message', new Message(this, remoteInfo, data));
          break;
      }
    });

    await new Promise<void>((res) =>
      this.#socket.bind(port, address, () => res()),
    );

    if (enableLog) readyLog(this.serviceName, port);
    this.emit('ready', port);
  }

  async sendText(
    info: AddressInfo,
    userId: number,
    packageName: string,
    roomId: string,
    text: string,
    timeout: number = 60000,
  ) {
    return new Promise<boolean>((res) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({
          event: 'send_text',
          session,
          data: { userId, packageName, roomId, text },
        }),
      );

      const t = setTimeout(() => {
        throw new RKError(RKError.TIMEOUT);
      }, timeout);

      const handler = (success: boolean) => {
        res(success);
        clearTimeout(t);
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(data, 0, data.length, info.port, info.address);
    });
  }

  async markAsRead(
    info: AddressInfo,
    userId: number,
    packageName: string,
    roomId: string,
    timeout: number = 60000,
  ) {
    return new Promise<boolean>((res) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({
          event: 'read',
          session,
          data: { userId, packageName, roomId },
        }),
      );

      const t = setTimeout(() => {
        throw new RKError(RKError.TIMEOUT);
      }, timeout);

      const handler = (success: boolean) => {
        res(success);
        clearTimeout(t);
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(data, 0, data.length, info.port, info.address);
    });
  }

  async getProfileImage(
    info: AddressInfo,
    userId: number,
    packageName: string,
    userHash: string,
  ) {
    return new Promise<string>((res) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({
          event: 'get_profile_image',
          session,
          data: { userId, packageName, userHash },
        }),
      );

      const t = setTimeout(() => {
        throw new RKError(RKError.TIMEOUT);
      }, 60000);

      const handler = (profileImage: string) => {
        res(profileImage);
        clearTimeout(t);
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(data, 0, data.length, info.port, info.address);
    });
  }

  async getRoomIcon(
    info: AddressInfo,
    userId: number,
    packageName: string,
    roomId: string,
  ) {
    return new Promise<string>((res) => {
      const session = randomUUID();
      const data = encodeURIComponent(
        JSON.stringify({
          event: 'get_room_icon',
          session,
          data: { userId, packageName, roomId },
        }),
      );

      const t = setTimeout(() => {
        throw new RKError(RKError.TIMEOUT);
      }, 60000);

      const handler = (icon: string) => {
        res(icon);
        clearTimeout(t);
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(data, 0, data.length, info.port, info.address);
    });
  }
}
