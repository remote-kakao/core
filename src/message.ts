import type { AddressInfo } from 'net';
import type { Server } from './server';

export class Message {
  #server: Server;
  #info: AddressInfo;
  room: {
    name: string;
    id: string;
    isGroupChat: boolean;
    icon: Promise<string>;
  };
  id: string;
  sender: { name: string; hash: string; profileImage: Promise<string> };
  content: string;
  containsMention: boolean;
  time: number;
  app: { packageName: string; userId: number };

  constructor(
    server: Server,
    info: AddressInfo,
    data: {
      room: { name: string; id: string; isGroupChat: boolean };
      id: string;
      sender: { name: string; hash: string };
      content: string;
      containsMention: boolean;
      time: number;
      app: { packageName: string; userId: number };
    },
  ) {
    const self = this;

    this.#server = server;
    this.#info = info;
    this.room = {
      name: data.room.name,
      id: data.room.id,
      isGroupChat: data.room.isGroupChat,
      get icon() {
        return self.#server.getRoomIcon(
          self.#info,
          self.app.userId,
          self.app.packageName,
          self.room.id,
        );
      },
    };
    this.id = data.id;
    this.sender = {
      name: data.sender.name,
      hash: data.sender.hash,
      get profileImage() {
        return self.#server.getProfileImage(
          self.#info,
          self.app.userId,
          self.app.packageName,
          self.room.id,
        );
      },
    };
    this.content = data.content;
    this.containsMention = data.containsMention;
    this.time = data.time;
    this.app = {
      packageName: data.app.packageName,
      userId: data.app.userId,
    };
  }

  replyText(text: string, timeout: number = 60000) {
    return this.#server.sendText(
      this.#info,
      this.app.userId,
      this.app.packageName,
      this.room.id,
      text,
      timeout,
    );
  }

  markAsRead(timeout: number = 60000) {
    return this.#server.markAsRead(
      this.#info,
      this.app.userId,
      this.app.packageName,
      this.room.id,
      timeout,
    );
  }
}
