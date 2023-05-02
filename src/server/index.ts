import type { Message } from '../message';

export type Events = {
  ready: (port: number) => void | Promise<void>;
  message: (message: Message) => void | Promise<void>;
};

export * from './udp';
