import type { Adapter, Addr } from './adapter.d.ts';
import { RKError } from './error.ts';
import EventEmitter from './event-emitter.ts';
import { Message } from './message.ts';

type Events<A extends Addr, R extends Addr> = {
  ready(): void | Promise<void>;
  message(message: Message<A, R>): void | Promise<void>;
};

type AppInfo = {
  androidUserId: number;
  packageName: string;
};

export class RemoteKakao<A extends Addr, R extends Addr> extends EventEmitter<
  Events<A, R>
> {
  #adapter: Adapter<A, R>;

  constructor(adapter: Adapter<A, R>) {
    super();
    this.#adapter = adapter;
  }

  async start(addr: A): Promise<void> {
    await this.#adapter.start(addr);

    this.#adapter.emitter.on('receivedData', (addr, { event, data }) => {
      switch (event) {
        case 'message':
          this.emit('message', new Message(this, addr, data));
      }
    });

    this.emit('ready');
  }

  // deno-lint-ignore no-explicit-any
  async sendEvent<T>(
    address: R,
    event: string,
    data: any,
    timeout = 60000,
  ): Promise<T> {
    const session = crypto.randomUUID();
    const encodedData = encodeURIComponent(
      JSON.stringify({ event, session, data }),
    );

    const t = setTimeout(() => {
      throw new RKError(RKError.TIMEOUT);
    }, timeout);

    const res = await this.#adapter.sendData<T>(address, session, encodedData);
    clearTimeout(t);

    return res;
  }

  async sendText(
    address: R,
    appInfo: AppInfo,
    roomId: string,
    text: string,
    options?: { timeout: number; fatal: boolean },
  ): Promise<boolean> {
    const { timeout = 60000, fatal = false } = options ?? {};
    const res = await this.sendEvent<boolean>(
      address,
      'send_text',
      {
        userId: appInfo.androidUserId,
        packageName: appInfo.packageName,
        roomId,
        text,
      },
      timeout,
    );
    if (typeof res !== 'boolean') {
      if (fatal) throw new RKError(RKError.INVALID_DATA);
      console.error('INVALID_DATA:', res);
    }
    return res;
  }

  async markAsRead(
    address: R,
    appInfo: AppInfo,
    roomId: string,
    options?: { timeout: number; fatal: boolean },
  ): Promise<boolean> {
    const { timeout = 60000, fatal = false } = options ?? {};
    const res = await this.sendEvent<boolean>(
      address,
      'mark_as_read',
      {
        userId: appInfo.androidUserId,
        packageName: appInfo.packageName,
        roomId,
      },
      timeout,
    );
    if (typeof res !== 'boolean') {
      if (fatal) throw new RKError(RKError.INVALID_DATA);
      console.error('INVALID_DATA:', res);
    }
    return res;
  }

  async getProfileImage(
    address: R,
    appInfo: AppInfo,
    userHash: string,
    options?: { timeout: number; fatal: boolean },
  ): Promise<string> {
    const { timeout = 60000, fatal = false } = options ?? {};
    const res = await this.sendEvent<string>(
      address,
      'get_profile_image',
      {
        userId: appInfo.androidUserId,
        packageName: appInfo.packageName,
        userHash,
      },
      timeout,
    );
    if (typeof res !== 'string') {
      if (fatal) throw new RKError(RKError.INVALID_DATA);
      console.error('INVALID_DATA:', res);
    }
    return res;
  }

  async getRoomIcon(
    address: R,
    appInfo: AppInfo,
    roomId: string,
    options?: { timeout: number; fatal: boolean },
  ): Promise<string> {
    const { timeout = 60000, fatal = false } = options ?? {};
    const res = await this.sendEvent<string>(
      address,
      'get_room_icon',
      {
        userId: appInfo.androidUserId,
        packageName: appInfo.packageName,
        roomId,
      },
      timeout,
    );
    if (typeof res !== 'string') {
      if (fatal) throw new RKError(RKError.INVALID_DATA);
      console.error('INVALID_DATA:', res);
    }
    return res;
  }
}
