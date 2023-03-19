import { UDPServer } from '../src';

const server = new UDPServer();

server.once('ready', (port) => {
  console.log(`포트 ${port}에 서버가 열렸어요!`);
});

server.on('chat', async (msg) => {
  if (msg.content === '>test') {
    msg.replyText('안녕하세요!');
  }
});

server.start();
