import type { Message } from '../message';
import { UDPServer } from './udp';

export type Events = {
  ready: (port: number) => void | Promise<void>;
  message: (message: Message) => void | Promise<void>;
};

export type Server = UDPServer;

export * from './udp';
