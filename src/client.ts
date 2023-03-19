import { createSocket } from 'dgram';

const socket = createSocket('udp4');

const data = JSON.stringify({ event: 'ww', text: 'zzz' });
const chunks = data.match(/.{1,512}/g)!;

chunks.forEach((chunk) => {
  socket.send(chunk, 3000);
});
