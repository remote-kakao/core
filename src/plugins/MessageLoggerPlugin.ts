import { Server, Message, RKPlugin } from '..';
import fs from 'node:fs';

export class MessageLoggerPlugin extends RKPlugin {
  config: { logFilePath?: string; enableAppInfo?: boolean };

  constructor(
    server: Server,
    config?: { logFilePath?: string; enableAppInfo?: boolean },
  ) {
    super(server, config);
    this.config = config ?? {};
  }

  onMessage = async (msg: Message) => {
    const content = `${msg.sender.name}${
      this.config.enableAppInfo
        ? ` (${msg.app.userId}:${msg.app.packageName})`
        : ''
    }: ${msg.content}`;
    this.log(content);
    if (this.config.logFilePath)
      fs.appendFileSync(this.config.logFilePath, content + '\n', 'utf-8');
  };
}
