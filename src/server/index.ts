import type { Message } from '../message';
import { UDPServer } from './udp';

export enum RKError {
  UNKNOWN = 0,
  TIMEOUT = 1,
  NO_SESSION = 2,
}

export type Events<Server extends UDPServer> = {
  ready: (port: number) => void | Promise<void>;
  chat: (message: Message<Server>) => void | Promise<void>;
};

export * from './udp';
