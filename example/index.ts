import { UDPServer } from '../src';

const prefix = '>';
const server = new UDPServer();

server.once('ready', (port) => {
  console.log(`Server ready on port ${port}!`);
});

server.on('chat', async (msg) => {
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

server.start();
