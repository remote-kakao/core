import type { Addr } from './adapter.d.ts';
import type { RemoteKakao } from './core.ts';

export class Message<A extends Addr, R extends Addr> {
  #rk: RemoteKakao<A, R>;
  #addr: R;
  room: {
    id: string;
    name: string;
    isGroupChat: boolean;
    icon: Promise<string>;
  };
  id: string;
  sender: { name: string; hash: string; profileImage: Promise<string> };
  content: string;
  containsMention: boolean;
  time: number;
  app: { androidUserId: number; packageName: string };

  constructor(
    rk: RemoteKakao<A, R>,
    addr: R,
    data: {
      room: { id: string; name: string; isGroupChat: boolean };
      id: string;
      sender: { name: string; hash: string };
      content: string;
      containsMention: boolean;
      time: number;
      app: { userId: number; packageName: string };
    },
  ) {
    // deno-lint-ignore no-this-alias
    const self = this;

    this.#rk = rk;
    this.#addr = addr;
    this.room = {
      id: data.room.id,
      name: data.room.name,
      isGroupChat: data.room.isGroupChat,
      get icon() {
        return self.#rk.getRoomIcon(self.#addr, self.app, self.room.id);
      },
    };
    this.id = data.id;
    this.sender = {
      name: data.sender.name,
      hash: data.sender.hash,
      get profileImage() {
        return self.#rk.getProfileImage(self.#addr, self.app, self.sender.hash);
      },
    };
    this.content = data.content;
    this.containsMention = data.containsMention;
    this.time = data.time;
    this.app = {
      androidUserId: data.app.userId,
      packageName: data.app.packageName,
    };
  }

  replyText(text: string, options?: { timeout: number; fatal: boolean }) {
    return this.#rk.sendText(this.#addr, this.app, this.room.id, text, options);
  }

  markAsRead(options?: { timeout: number; fatal: boolean }) {
    return this.#rk.markAsRead(this.#addr, this.app, this.room.id, options);
  }
}
