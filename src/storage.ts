import { LocalStorage } from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { randomUUID } from "crypto";

export type Todo = { id: string; title: string; createdAt: number; completedAt?: number };
export type Scratchpad = { id: string; title: string; content: string; updatedAt: number };

/**
 * State persisted as JSON in Raycast LocalStorage. `update` takes a function of the latest value,
 * so callbacks captured by pushed views (forms, toasts) never write stale data.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [isLoading, setIsLoading] = useState(true);
  const latest = useRef<T>(initial);

  useEffect(() => {
    LocalStorage.getItem<string>(key).then((raw) => {
      if (raw) {
        latest.current = JSON.parse(raw) as T;
        setValue(latest.current);
      }
      setIsLoading(false);
    });
  }, [key]);

  const update = useCallback(
    async (fn: (prev: T) => T) => {
      latest.current = fn(latest.current);
      setValue(latest.current);
      await LocalStorage.setItem(key, JSON.stringify(latest.current));
    },
    [key],
  );

  return { value, update, isLoading };
}

export function useTodos() {
  const { value: todos, update, isLoading } = usePersistentState<Todo[]>("todos", []);

  const setCompleted = (id: string, completedAt: number | undefined) =>
    update((prev) => prev.map((t) => (t.id === id ? { ...t, completedAt } : t)));

  return {
    todos,
    isLoading,
    add: (title: string) => update((prev) => [{ id: randomUUID(), title, createdAt: Date.now() }, ...prev]),
    rename: (id: string, title: string) => update((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t))),
    complete: (id: string) => setCompleted(id, Date.now()),
    reopen: (id: string) => setCompleted(id, undefined),
    remove: (ids: string[]) => update((prev) => prev.filter((t) => !ids.includes(t.id))),
  };
}

export type TodoStore = ReturnType<typeof useTodos>;

export function useScratchpads() {
  const { value: pads, update, isLoading } = usePersistentState<Scratchpad[]>("scratchpads", []);

  return {
    pads,
    isLoading,
    create: async (title: string, content: string) => {
      const pad = { id: randomUUID(), title, content, updatedAt: Date.now() };
      await update((prev) => [...prev, pad]);
      return pad;
    },
    save: (id: string, title: string, content: string) =>
      update((prev) => prev.map((p) => (p.id === id ? { ...p, title, content, updatedAt: Date.now() } : p))),
    remove: (id: string) => update((prev) => prev.filter((p) => p.id !== id)),
  };
}

export type ScratchpadStore = ReturnType<typeof useScratchpads>;
