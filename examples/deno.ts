import { DenoUDPAdapter } from '../src/adapter-deno-udp.ts';
import { RemoteKakao } from '../src/mod.ts';

const rk = new RemoteKakao(new DenoUDPAdapter());

rk.once('ready', () => {
  console.log('ready');
});

rk.on('message', (msg) => {
  if (msg.content === '>ping') {
    msg.replyText('Pong!');
  }
});

rk.start({ hostname: '0.0.0.0', port: 3000 });
