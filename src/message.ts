import type { AddressInfo } from 'net';
import type { UDPServer } from './server';

export class Message<Server extends UDPServer> {
  #server: Server;
  #info: AddressInfo;
  room: { name: string; id: string; isGroupChat: boolean };
  id: string;
  sender: string;
  content: string;
  app: { packageName: string; userId: number };

  constructor(
    server: Server,
    info: AddressInfo,
    data: {
      room: string;
      content: string;
      sender: string;
      isGroupChat: boolean;
      profileImage: string;
      packageName: string;
      userId: number;
      chatId: string;
      logId: string;
    },
  ) {
    this.#server = server;
    this.#info = info;
    this.room = {
      name: data.room,
      id: data.chatId,
      isGroupChat: data.isGroupChat,
    };
    this.id = data.logId;
    this.sender = data.sender;
    this.content = data.content;
    this.app = {
      packageName: data.packageName,
      userId: data.userId,
    };
  }

  replyText(text: string, timeout: number = 60000) {
    return this.#server.sendText(this.#info, this.room.id, text, timeout);
  }
}
