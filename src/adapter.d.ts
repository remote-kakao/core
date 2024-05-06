import type { EventEmitter } from './event-emitter.ts';

export type Addr = Record<string, any>;

export interface ReceivedData {
  event: string;
  data: any;
}

export type AdapterEvents<A extends Addr, R extends Addr> = {
  invalidData(data: string): void;
  receivedData(addr: R, data: ReceivedData): void;
};

export interface Adapter<A extends Addr, R extends Addr> {
  emitter: EventEmitter<AdapterEvents<A, R>>;
  start(addr: A): Promise<void> | void;
  sendData<T>(addr: R, session: string, data: string): Promise<T> | T;
}
