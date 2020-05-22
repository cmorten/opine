/**
 * Module dependencies
 */
export {
  serve,
  serveTLS,
  HTTPSOptions,
  HTTPOptions,
  Server,
  ServerRequest,
  Response,
} from "https://deno.land/std@0.52.0/http/server.ts";
export {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.52.0/http/http_status.ts";
export {
  setCookie,
  Cookie,
  delCookie,
} from "https://deno.land/std@0.52.0/http/cookie.ts";
export {
  extname,
  fromFileUrl,
  basename,
} from "https://deno.land/std@0.52.0/path/mod.ts";
export { setImmediate } from "https://deno.land/std@0.52.0/node/timers.ts";
export { Sha1 } from "https://deno.land/std@0.52.0/hash/sha1.ts";
export { encoder } from "https://deno.land/std@0.52.0/encoding/utf8.ts";
export {
  Evt as EventEmitter,
  to as getEvent,
} from "https://deno.land/x/evt@v1.6.8/mod.ts";
export { contentType } from "https://deno.land/x/media_types@v2.3.1/mod.ts";

/**
 * Test dependencies
 */
export { expect } from "https://deno.land/x/expect@9effa6c6da3bcf4b66114b44e6b1662e85c91337/mod.ts";

export const TEST_TIMEOUT = 3000;

/**
 * A no-op _describe_ method.
 * 
 * @param name 
 * @param fn 
 */
export async function describe(name: string, fn: () => void | Promise<void>) {
  fn();
}

/**
 * An _it_ wrapper around `Deno.test`.
 * 
 * @param name 
 * @param fn 
 */
export async function it(
  name: string,
  fn: (done?: any) => void | Promise<void>,
) {
  Deno.test(name, async () => {
    let done: any = () => {};
    let race: Promise<unknown> = Promise.resolve();

    if (fn.length === 1) {
      let resolve: () => void;
      const donePromise = new Promise((r) => {
        resolve = r;
      });

      let timeoutId: number;

      race = Promise.race([
        new Promise((_, reject) =>
          timeoutId = setTimeout(() => {
            reject(
              new Error(
                `test "${name}" failed to complete by calling "done" within ${TEST_TIMEOUT}ms.`,
              ),
            );
          }, TEST_TIMEOUT)
        ),
        donePromise,
      ]);

      done = () => {
        clearTimeout(timeoutId);
        resolve();
      };
    }

    await fn(done);
    await race;
  });
}
