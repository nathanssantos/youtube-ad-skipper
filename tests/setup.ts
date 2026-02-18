import { vi } from "vitest";

const storageMock = (() => {
  let store: Record<string, unknown> = {};
  const listeners: Array<(changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void> = [];

  return {
    local: {
      get: vi.fn((keys: string[], callback?: (result: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {};
        for (const key of keys) {
          if (key in store) result[key] = store[key];
        }
        if (callback) callback(result);
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
        const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
        for (const [key, value] of Object.entries(items)) {
          changes[key] = { oldValue: store[key], newValue: value };
          store[key] = value;
        }
        for (const listener of listeners) {
          listener(changes);
        }
        if (callback) callback();
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn((fn: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void) => {
        listeners.push(fn);
      }),
    },
    _reset: () => {
      store = {};
      listeners.length = 0;
    },
    _setStore: (data: Record<string, unknown>) => {
      store = { ...data };
    },
  };
})();

const runtimeMock = {
  onMessage: {
    addListener: vi.fn(),
  },
  onInstalled: {
    addListener: vi.fn(),
  },
  sendMessage: vi.fn(),
};

const actionMock = {
  setBadgeText: vi.fn(),
  setBadgeBackgroundColor: vi.fn(),
};

const tabsMock = {
  query: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn().mockResolvedValue(undefined),
};

const commandsMock = {
  onCommand: {
    addListener: vi.fn(),
  },
};

const chromeMock = {
  storage: storageMock,
  runtime: runtimeMock,
  action: actionMock,
  tabs: tabsMock,
  commands: commandsMock,
};

vi.stubGlobal("chrome", chromeMock);

export { chromeMock, storageMock };
