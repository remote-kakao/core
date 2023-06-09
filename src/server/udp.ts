import EventEmitter from 'node:events';
import type TypedEmitter from 'typed-emitter';
import { createSocket, type Socket, type SocketType } from 'node:dgram';
import type { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import { Events, Message, RKPlugin } from '..';
import RKError from '../error';
import { readyLog, rkColor, rkLog } from '../logger';
import { Config, Data } from '../types';

export class UDPServer extends (EventEmitter as new () => TypedEmitter<Events>) {
  #socket: Socket;
  #sessionEmitter: EventEmitter;
  #plugins: RKPlugin[] = [];
  serviceName?: string;

  constructor({
    socketType = 'udp4',
    serviceName,
  }: { socketType?: SocketType; serviceName?: string } = {}) {
    // rome-ignore lint/correctness/noInvalidConstructorSuper:
    super();
    this.#socket = createSocket(socketType);
    this.#sessionEmitter = new EventEmitter();
    this.serviceName = serviceName;
  }

  public usePlugin<
    T extends new (
      server: UDPServer,
      config?: Config,
    ) => RKPlugin,
  >(Plugin: T, pluginOptions?: ConstructorParameters<T>[1], enableLog = true) {
    const plugin = new Plugin(this, pluginOptions);

    if (plugin.extendServerClass) plugin.extendServerClass(this);
    if (plugin.onReady) this.on('ready', plugin.onReady);
    if (plugin.onMessage)
      this.on('message', async (message: Message) => {
        if (plugin.extendMessageClass) await plugin.extendMessageClass(message);
        if (plugin.onMessage) plugin.onMessage(message);
      });

    this.#plugins.push(plugin);

    if (enableLog) rkLog(`Plugin ${rkColor(plugin.constructor.name)} enabled!`);

    return plugin;
  }

  async start(port = 3000, address?: string, enableLog = true) {
    this.#socket.on('message', (msg, remoteInfo) => {
      const { event, data } = JSON.parse(msg.toString('utf-8'));

      if (event.startsWith('reply:')) {
        return this.#sessionEmitter.emit(event.slice('reply:'.length), data);
      }
      switch (event) {
        case 'message':
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

  async sendEvent<T>(
    info: AddressInfo,
    event: string,
    data: Data,
    timeout = 60000,
  ) {
    return new Promise<T>((res) => {
      const session = randomUUID();
      const encodedData = encodeURIComponent(
        JSON.stringify({ event, session, data }),
      );

      const t = setTimeout(() => {
        throw new RKError(RKError.TIMEOUT);
      }, timeout);

      const handler = (success: T) => {
        res(success);
        clearTimeout(t);
        this.#sessionEmitter.off(session, handler);
      };

      this.#sessionEmitter.on(session, handler);
      this.#socket.send(
        encodedData,
        0,
        encodedData.length,
        info.port,
        info.address,
      );
    });
  }

  async sendText(
    info: AddressInfo,
    userId: number,
    packageName: string,
    roomId: string,
    text: string,
    timeout = 60000,
  ) {
    return this.sendEvent<boolean>(
      info,
      'send_text',
      { userId, packageName, roomId, text },
      timeout,
    );
  }

  async markAsRead(
    info: AddressInfo,
    userId: number,
    packageName: string,
    roomId: string,
    timeout = 60000,
  ) {
    return this.sendEvent<boolean>(
      info,
      'read',
      { userId, packageName, roomId },
      timeout,
    );
  }

  async getProfileImage(
    info: AddressInfo,
    userId: number,
    packageName: string,
    userHash: string,
  ) {
    return this.sendEvent<string>(info, 'get_profile_image', {
      userId,
      packageName,
      userHash,
    });
  }

  async getRoomIcon(
    info: AddressInfo,
    userId: number,
    packageName: string,
    roomId: string,
  ) {
    return this.sendEvent<string>(info, 'get_room_icon', {
      userId,
      packageName,
      roomId,
    });
  }
}
