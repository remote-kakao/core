import { UDPServer } from '../src';
import { MessageLoggerPlugin } from '../src/plugins/MessageLoggerPlugin';
import path from 'node:path';
import fs from 'node:fs';

const prefix = '>';
const server = new UDPServer({ serviceName: 'remote-kakao' });

server.usePlugin(MessageLoggerPlugin, {
  logFilePath: path.join(process.cwd(), 'messages.log'),
  enableAppInfo: true,
});

server.on('message', async (msg) => {
  console.log(msg);
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.split(' ');
  const cmd = args.shift()?.slice(prefix.length);

  if (cmd === 'ping') {
    // fs.writeFileSync(
    //   path.join(process.cwd(), 'profile.png'),
    //   await msg.sender.profileImage,
    //   'base64',
    // );
    // fs.writeFileSync(
    //   path.join(process.cwd(), 'icon.png'),
    //   await msg.room.icon,
    //   'base64',
    // );
    /*
      this command's result is the ping between Node.js and MessengerBot,
      not between MessengerBot and the KakaoTalk server.
    */
    const timestamp = Date.now();
    await msg.replyText('Pong!');
    msg.replyText(`${Date.now() - timestamp}ms`);
  } else if (cmd === 'read') {
    msg.markAsRead();
  } else if (cmd === 'containsMention') {
    msg.replyText(msg.containsMention.toString());
  } else if (cmd === 'icon') {
    fs.writeFileSync(
      path.join(process.cwd(), 'icon.png'),
      await msg.room.icon,
      'base64',
    );
  }
});

server.start(3000, undefined);
