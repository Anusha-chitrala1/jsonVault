type LogEntry = {
  id: number;
  method: string;
  path: string;
  status: number | null;
  ts: number;
  duration: number | null;
};

type Listener = (logs: LogEntry[]) => void;

let seq = 0;
let logs: LogEntry[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l([...logs]));
}

export function addLog(method: string, path: string): number {
  const id = ++seq;
  logs = [{ id, method, path, status: null, ts: Date.now(), duration: null }, ...logs].slice(0, 50);
  notify();
  return id;
}

export function updateLog(id: number, status: number, duration: number) {
  logs = logs.map((l) => (l.id === id ? { ...l, status, duration } : l));
  notify();
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  fn([...logs]);
  return () => listeners.delete(fn);
}

export type { LogEntry };
