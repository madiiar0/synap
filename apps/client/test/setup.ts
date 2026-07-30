import "../src/lib/i18n";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

interface MockEntry {
  isIntersecting: boolean;
}

type MockCallback = (entries: MockEntry[]) => void;

const observers = new Set<{ cb: MockCallback }>();

/** Manual-trigger IntersectionObserver mock: tests fire visibility explicitly. */
class MockIntersectionObserver {
  cb: MockCallback;

  constructor(cb: MockCallback) {
    this.cb = cb;
    observers.add(this);
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {
    observers.delete(this);
  }
}

(globalThis as { IntersectionObserver: unknown }).IntersectionObserver =
  MockIntersectionObserver;

export function fireIntersections(): void {
  for (const observer of [...observers]) {
    observer.cb([{ isIntersecting: true }]);
  }
}

if (typeof window.matchMedia !== "function") {
  (window as { matchMedia: unknown }).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    onchange: null,
    dispatchEvent: () => false,
  });
}
