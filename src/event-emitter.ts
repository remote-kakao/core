// deno-lint-ignore no-explicit-any
export class EventEmitter<
  Events extends Record<string, (...args: any[]) => void>,
> {
  #events = new Map<keyof Events, Events[keyof Events][]>();

  on<E extends keyof Events>(event: E, listener: Events[E]): this {
    const e = this.#events.get(event);

    if (e) e.push(listener);
    else this.#events.set(event, [listener]);

    return this;
  }
  once<E extends keyof Events>(event: E, listener: Events[E]): this {
    const _listener = ((...args: Parameters<Events[E]>) => {
      this.off(event, _listener);
      listener(...args);
    }) as Events[E];

    // @ts-ignore
    _listener._ = listener;

    return this.on(event, _listener);
  }
  emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): this {
    const events = this.#events.get(event) ?? [];

    for (const listener of events) {
      listener(...args);
    }

    return this;
  }
  off<E extends keyof Events>(event: E, listener: Events[E]): this {
    const events = this.#events.get(event) ?? [];
    const liveEvents: Events[keyof Events][] = events.filter(
      // @ts-ignore
      (_listener) => _listener !== listener && _listener._ !== listener,
    );

    if (liveEvents.length > 0) this.#events.set(event, liveEvents);
    else this.#events.delete(event);

    return this;
  }
}
