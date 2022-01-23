import { Message } from '.';

interface Plugin {
  onReady?(): void;
  onMessage?(message: Message): void;
}

export default Plugin;
