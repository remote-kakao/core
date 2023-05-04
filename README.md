![remote-kakao banner](https://raw.githubusercontent.com/remote-kakao/core/main/images/banner.png)

# remote-kakao (alpha)

[Discord Server](https://discord.gg/T9PrmtcR8a)

## About

remote-kakao is a Node.js module that makes it easier to create unofficial KakaoTalk bots by bridging [MessengerBot](https://play.google.com/store/apps/details?id=com.xfl.msgbot) and Node.js, over UDP or TCP.

## Requirements

- Node.js
- Android smartphone with [KakaoTalk](https://play.google.com/store/apps/details?id=com.kakao.talk) & [MessengerBot](https://play.google.com/store/apps/details?id=com.xfl.msgbot) installed

## Example

```ts
import { UDPServer } from "@remote-kakao/core";

const prefix = ">";
const server = new UDPServer();

server.once("ready", (port) => {
  console.log(`Server ready on port ${port}!`);
});

server.on("chat", async (msg) => {
  if (!msg.content.startsWith(prefix)) return;

  const args = msg.content.split(" ");
  const cmd = args.shift()?.slice(prefix.length);

  if (cmd === "ping") {
    /*
      this command's result is the ping between Node.js and MessengerBot,
      not between MessengerBot and the KakaoTalk server.
    */
    const timestamp = Date.now();
    await msg.replyText("Pong!");
    msg.replyText(`${Date.now() - timestamp}ms`);
  }
});

server.start();
```

## Plugins

<!-- [@remote-kakao/kakaolink-plugin](https://github.com/remote-kakao/kakaolink-plugin) -->

[@remote-kakao/rkeval-plugin](https://github.com/remote-kakao/rkeval-plugin)
