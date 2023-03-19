import type Message from 'message';
import type { UDPServer } from './udp';

export type Events<S extends UDPServer> = {
  ready: (port: number) => Promise<void> | void;
  chat: (data: Message<S>) => Promise<void> | void;
};

export * from './udp';
