import { UDPServer } from '../src';
import { MessageLoggerPlugin } from '../src/plugins/MessageLoggerPlugin';
import path from 'node:path';

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
    /*
      this command's result is the ping between Node.js and MessengerBot,
      not between MessengerBot and the KakaoTalk server.
    */
    const timestamp = Date.now();
    await msg.replyText('Pong!');
    msg.replyText(`${Date.now() - timestamp}ms`);
  }
});

server.start(3000, undefined);
