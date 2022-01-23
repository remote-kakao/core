import { Message, Server } from '.';

interface Plugin {
  server?: Server;
  onReady?(): void;
  onMessage?(message: Message): void;
}

export default Plugin;
