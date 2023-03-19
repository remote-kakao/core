import { UDPServer } from 'server';

const server = new UDPServer();

server.once('ready', (port) => {
  console.log(`listening on port ${port}!`);
});

server.on('chat', async (msg) => {
  const { success } = await msg.replyText('ww');
});

server.start();
