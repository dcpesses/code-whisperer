/* eslint-disable curly */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint--disable unicorn/no-null */

/*
 * Resetting window.location between tests is unfortunately a hard topic with JSDOM.
 *
 * https://gist.github.com/tkrotoff/52f4a29e919445d6e97f9a9e44ada449
 *
 * FIXME JSDOM leaves the history in place after every test, so the history will be dirty.
 * Also its implementations for window.location and window.history are lacking.
 * - https://github.com/jsdom/jsdom/blob/22.1.0/lib/jsdom/living/window/Location-impl.js
 * - https://github.com/jsdom/jsdom/blob/22.1.0/lib/jsdom/living/window/History-impl.js
 * - https://github.com/jsdom/jsdom/blob/22.1.0/lib/jsdom/living/window/SessionHistory.js
 *
 * What about Happy DOM? Implementations are empty:
 * - https://github.com/capricorn86/happy-dom/blob/v12.10.3/packages/happy-dom/src/location/Location.ts
 * - https://github.com/capricorn86/happy-dom/blob/v12.10.3/packages/happy-dom/src/history/History.ts
 *
 *
 * window.location and window.history should work together:
 * window.history should update the location, and changing the location should push a new state in the history
 *
 * Solution: re-implement window.location and window.history
 * The code is synchronous instead of asynchronous, yet it fires "popstate" events
 *
 * Inspired by:
 * - https://github.com/jestjs/jest/issues/5124#issuecomment-792768806
 * - https://github.com/firefox-devtools/profiler/blob/f894531be77dee00bb641f49a657b072183ec1fa/src/test/fixtures/mocks/window-navigation.js
 *
 *
 * Related issues:
 * - https://github.com/jestjs/jest/issues/5987
 * - https://github.com/jestjs/jest/issues/890
 * - https://github.com/jestjs/jest/issues/5124
 * - https://stackoverflow.com/a/76424392
 *
 * - Huge hope on jsdom.reconfigure() (tried by patching Vitest JSDOM env), doesn't work
 *   https://github.com/vitest-dev/vitest/discussions/2383
 *   https://github.com/simon360/jest-environment-jsdom-global/blob/v4.0.0/environment.js
 *   https://github.com/simon360/jest-environment-jsdom-global/blob/v4.0.0/README.md#using-jsdom-in-your-test-suite
 */

class WindowLocationMock implements Location {
  private url: URL;

  internalSetURLFromHistory(newURL: string | URL) {
    this.url = new URL(newURL, this.url);
  }

  constructor(url: string) {
    this.url = new URL(url);
  }

  toString() {
    return this.url.toString();
  }

  readonly ancestorOrigins = [] as unknown as DOMStringList;

  get href() {
    return this.url.toString();
  }
  set href(newUrl) {
    this.assign(newUrl);
  }

  get origin() {
    return this.url.origin;
  }

  get protocol() {
    return this.url.protocol;
  }
  set protocol(v) {
    const newUrl = new URL(this.url);
    newUrl.protocol = v;
    this.assign(newUrl);
  }

  get host() {
    return this.url.host;
  }
  set host(v) {
    const newUrl = new URL(this.url);
    newUrl.host = v;
    this.assign(newUrl);
  }

  get hostname() {
    return this.url.hostname;
  }
  set hostname(v) {
    const newUrl = new URL(this.url);
    newUrl.hostname = v;
    this.assign(newUrl);
  }

  get port() {
    return this.url.port;
  }
  set port(v) {
    const newUrl = new URL(this.url);
    newUrl.port = v;
    this.assign(newUrl);
  }

  get pathname() {
    return this.url.pathname;
  }
  set pathname(v) {
    const newUrl = new URL(this.url);
    newUrl.pathname = v;
    this.assign(newUrl);
  }

  get search() {
    return this.url.search;
  }
  set search(v) {
    const newUrl = new URL(this.url);
    newUrl.search = v;
    this.assign(newUrl);
  }

  get hash() {
    return this.url.hash;
  }
  set hash(v) {
    const newUrl = new URL(this.url);
    newUrl.hash = v;
    this.assign(newUrl);
  }

  assign(newUrl: string | URL) {
    window.history.pushState(null, 'origin:location', newUrl);
    this.reload();
  }

  replace(newUrl: string | URL) {
    window.history.replaceState(null, 'origin:location', newUrl);
    this.reload();
  }

  reload() {
    // Do nothing
  }
}

const originalLocation = window.location;

export function mockWindowLocation(url: string) {
  //window.location = new WindowLocationMock(url);
  //document.location = window.location;
  Object.defineProperty(window, 'location', {
    writable: true,
    value: new WindowLocationMock(url)
  });
}

export function restoreWindowLocation() {
  //window.location = originalLocation;
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation
  });
}

function verifyOrigin(newURL: string | URL, method: 'pushState' | 'replaceState') {
  const currentOrigin = new URL(window.location.href).origin;
  if (new URL(newURL, currentOrigin).origin !== currentOrigin) {
    // Same error message as Chrome 118
    throw new DOMException(
      `Failed to execute '${method}' on 'History': A history state object with URL '${newURL.toString()}' cannot be created in a document with origin '${currentOrigin}' and URL '${
        window.location.href
      }'.`
    );
  }
}

export class WindowHistoryMock implements History {
  private index = 0;
  // Should be private but making it public makes it really easy to verify everything is OK in some tests
  public sessionHistory: [{ state: any; url: string }] = [
    { state: null, url: window.location.href }
  ];

  get length() {
    return this.sessionHistory.length;
  }

  scrollRestoration = 'auto' as const;

  get state() {
    return this.sessionHistory[this.index].state;
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(+1);
  }

  go(delta = 0) {
    if (delta === 0) {
      window.location.reload();
    }
    const newIndex = this.index + delta;
    if (newIndex < 0 || newIndex >= this.length) {
      // Do nothing
    } else if (newIndex === this.index) {
      // Do nothing
    } else {
      this.index = newIndex;

      (window.location as WindowLocationMock).internalSetURLFromHistory(
        this.sessionHistory[this.index].url
      );

      dispatchEvent(new PopStateEvent('popstate', { state: this.state }));
    }
  }

  pushState(data: any, unused: string, url?: string | URL | null) {
    if (url) {
      if (unused !== 'origin:location') verifyOrigin(url, 'pushState');
      (window.location as WindowLocationMock).internalSetURLFromHistory(url);
    }
    this.sessionHistory.push({
      state: structuredClone(data),
      url: window.location.href
    });
    this.index++;
  }

  replaceState(data: any, unused: string, url?: string | URL | null) {
    if (url) {
      if (unused !== 'origin:location') verifyOrigin(url, 'replaceState');
      (window.location as WindowLocationMock).internalSetURLFromHistory(url);
    }
    this.sessionHistory[this.index] = {
      state: structuredClone(data),
      url: window.location.href
    };
  }
}

const originalHistory = window.history;

export function mockWindowHistory() {
  //window.history = new WindowHistoryMock();
  Object.defineProperty(window, 'history', {
    writable: true,
    value: new WindowHistoryMock()
  });
}

export function restoreWindowHistory() {
  //window.history = originalHistory;
  Object.defineProperty(window, 'history', {
    writable: true,
    value: originalHistory
  });
}
