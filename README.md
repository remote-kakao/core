![remote](https://raw.githubusercontent.com/remote-kakao/core/main/images/banner.png)

# @remote-kakao/core

A Node.js module to make unofficial KakaoTalk bots (within the legal scope).

## Example

```ts
import { Server } from '@remote-kakao/core';

const config = {
  email: 'email@kakao.com',
  password: 'p@ssw0rd',
  key: '00000000000000000000000000000000',
  host: 'https://example.com',
};

const server = new Server({ useKakaoLink: true });

server.on('message', async (msg) => {
  const prefix = '>';
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.split(' ');
  const cmd = args.shift()?.slice(prefix.length);

  switch (cmd) {
    case 'ping': // not accurate
      const timestamp = Date.now();
      await msg.replyText('Pong!');
      msg.replyText(`${Date.now() - timestamp}ms`);
      break;
    case 'kaling':
      msg.replyKakaoLink({ id: 00000, args: { title: args[0], description: args[1] } });
      break;
  }
});

server.start(3000, config);
```
