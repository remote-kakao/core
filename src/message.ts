import type { RemoteInfo } from 'dgram';
import type { UDPServer } from 'server';

class Message<S extends UDPServer> {
  server: S;
  remoteInfo: RemoteInfo;
  room: string;
  content: string;
  sender: string;
  isGroupChat: boolean;
  profileImage: string;
  packageName: string;
  userId: number;
  chatId: string;
  logId: string;

  constructor(
    server: S,
    remoteInfo: RemoteInfo,
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
    this.server = server;
    this.remoteInfo = remoteInfo;
    this.room = data.room;
    this.content = data.content;
    this.sender = data.sender;
    this.isGroupChat = data.isGroupChat;
    this.profileImage = data.profileImage;
    this.packageName = data.packageName;
    this.userId = data.userId;
    this.chatId = data.chatId;
    this.logId = data.logId;
  }

  replyText(text: string, timeout: number = 60000) {
    return this.server.sendText(this.remoteInfo, this.room, text, timeout);
  }
}

export default Message;
