import "@testing-library/jest-dom";

/**
 * jsdom ships no IntersectionObserver, and framer-motion needs one for every
 * `whileInView` reveal — which is most of this site. Without it, rendering any
 * section component throws.
 *
 * The stub reports each observed element as intersecting right away, so reveals
 * settle into their "show" state and tests can assert on what a visitor actually
 * sees after scrolling.
 *
 * It fires asynchronously, like the real thing, to avoid running the callback
 * inside React's layout effect. So assert a revealed element with `waitFor` or
 * `findBy*` — a synchronous `getBy*` + `toBeVisible()` runs before the reveal and
 * still sees `opacity: 0`. Components that animate on reveal (e.g. the Stats
 * counter) also need that wait, or React logs an act() warning.
 */
class TestIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "0px";
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(private callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    queueMicrotask(() => {
      this.callback(
        [
          {
            target,
            isIntersecting: true,
            intersectionRatio: 1,
            time: 0,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
          } as IntersectionObserverEntry,
        ],
        this,
      );
    });
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: TestIntersectionObserver,
});
globalThis.IntersectionObserver = TestIntersectionObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

/**
 * jsdom ships no ResizeObserver either, and Embla (the photo carousel on the
 * academy page) calls it on mount. Rendering that page in a test throws without
 * this stub. It never reports a resize, which is what we want: the carousel
 * settles on its first slide instead of animating under the assertions.
 */
class TestResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: TestResizeObserver,
});
globalThis.ResizeObserver = TestResizeObserver;
