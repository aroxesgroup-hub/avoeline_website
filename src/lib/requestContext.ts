import { AsyncLocalStorage } from "async_hooks";

type Store = { requestId: string };

const storage = new AsyncLocalStorage<Store>();

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
