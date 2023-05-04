![remote-kakao banner](https://raw.githubusercontent.com/remote-kakao/core/main/images/banner.png)

# remote-kakao (alpha)

[Discord Server](https://discord.gg/T9PrmtcR8a)

## About

remote-kakao is a Node.js module that makes it easier to create unofficial KakaoTalk bots by bridging [MessengerBot](https://play.google.com/store/apps/details?id=com.xfl.msgbot) and Node.js, over UDP.

## Requirements

- Node.js
- Android smartphone with [KakaoTalk](https://play.google.com/store/apps/details?id=com.kakao.talk) & [MessengerBot](https://play.google.com/store/apps/details?id=com.xfl.msgbot) installed

## Client

You have to create a new bot in MessengerBot, and paste [the client code](https://github.com/remote-kakao/core-client/releases/tag/2.0.0-alpha.3) into the new bot\`s code. Then change the values of the `config` object on top of the file.

## Example

```ts
import { UDPServer } from "@remote-kakao/core";

const prefix = ">";
const server = new UDPServer({ serviceName: "Example Service" });

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
