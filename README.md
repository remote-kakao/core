![remote](https://raw.githubusercontent.com/remote-kakao/core/main/images/banner.png)

# remote-kakao

[Discord Server](https://discord.gg/T9PrmtcR8a)

## About

remote-kakao is a Node.js module to make unofficial (& legal) KakaoTalk bots by connecting [MessengerBot](https://play.google.com/store/apps/details?id=com.xfl.msgbot) with Node.js, using UDP.

## Requirements

- Node.js v18+ (Recommended)
- Android smartphone w/ [KakaoTalk](https://play.google.com/store/apps/details?id=com.kakao.talk) & [MessengerBot](https://play.google.com/store/apps/details?id=com.xfl.msgbot)
- Devoted love toward cats

## [Guide (Korean)](https://cafe.naver.com/nameyee/39660)

A [guide for this module](https://cafe.naver.com/nameyee/39660) is posted in the NAVER Cafe [카카오톡 봇 커뮤니티](https://cafe.naver.com/nameyee) (KakaoTalk Bot Community), in Korean.

## Example

```ts
import { Server } from '@remote-kakao/core';

const prefix = '>';
const server = new Server();

server.on('message', async (msg) => {
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.split(' ');
  const cmd = args.shift()?.slice(prefix.length);

  if (cmd === 'ping') {
    /*
      this command's result is the ping between Node.js and MessengerBot,
      not between MessengerBot and the KakaoTalk server.
    */
    const timestamp = Date.now();
    await msg.reply('Pong!');
    msg.reply(`${Date.now() - timestamp}ms`);
  }
});

server.start(3000);
```

## Plugins

[@remote-kakao/kakaolink-plugin](https://github.com/remote-kakao/kakaolink-plugin)
