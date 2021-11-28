import { expect } from "./deps.ts";
/**
 * Test timeout.
 */
export const TEST_TIMEOUT = 3000;

/**
 * A no-op _describe_ method.
 *
 * @param name
 * @param fn
 */
export function describe(_name: string, fn: () => void | Promise<void>) {
  return fn();
}

export type Done = (err?: unknown) => void;

/**
 * An stub to remove a test.
 *
 * @param name
 * @param fn
 */
export function nit(
  _name: string,
  _fn: (done: Done) => void | Promise<void>,
  _options?: Partial<Deno.TestDefinition>,
) {}

/**
 * An _it_ wrapper around `Deno.test`.
 *
 * @param name
 * @param fn
 */
export function it(
  name: string,
  fn: (done: Done) => void | Promise<void>,
  options?: Partial<Deno.TestDefinition>,
) {
  Deno.test({
    ...options,
    name,
    fn: async () => {
      let testError: unknown;

      let done: Done = (err?: unknown) => {
        if (err) {
          testError =  err;
        }
      };

      let race: Promise<unknown> = Promise.resolve();
      let timeoutId: number;

      if (fn.length === 1) {
        let resolve: (value?: unknown) => void;
        const donePromise = new Promise((r) => {
          resolve = r;
        });

        race = Promise.race([
          new Promise((_, reject) =>
            timeoutId = setTimeout(() => {
              clearTimeout(timeoutId);

              reject(
                new Error(
                  `test "${name}" failed to complete by calling "done" within ${TEST_TIMEOUT}ms.`,
                ),
              );
            }, TEST_TIMEOUT)
          ),
          donePromise,
        ]);

        done = (err?: unknown) => {
          clearTimeout(timeoutId);
          resolve();

          if (err) {
            testError = err;
          }
        };
      }

      await fn(done);
      await race;

      if (timeoutId!) {
        clearTimeout(timeoutId);
      }

      // REF: https://github.com/denoland/deno/blob/987716798fb3bddc9abc7e12c25a043447be5280/ext/timers/01_timers.js#L353
      await new Promise((resolve) => setTimeout(resolve, 0));

      if (testError) {
        throw testError;
      }
    },
  });
}

export const after = (count: number, done: Done) => {
  let _count = 0;

  return (err?: unknown) => {
    _count++;

    if (err) {
      done(err);
    } else if (_count >= count) {
      done();
    }
  };
};

/**
 * Returns an object subset of `obj`, whose properties are in `keys`.
 *
 * @param obj
 * @param props
 */
export function pick<
  T extends Record<string, unknown>,
  K extends keyof T,
>(obj: T, keys: K[]): Pick<T, K> {
  const output = {} as Pick<T, K>;

  for (const key of keys) {
    output[key] = obj[key];
  }

  return output;
}

/**
 * Returns an object subset of `obj`, whose properties are not in `keys`.
 * @param obj
 * @param keys
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const copy = Object.create(Object.getPrototypeOf(obj));
  Object.defineProperties(copy, Object.getOwnPropertyDescriptors(obj));

  for (const key of keys) {
    delete copy[key];
  }

  return copy as Omit<T, K>;
}

export const shouldNotHaveHeader = (field: string) =>
  (res: any) => {
    expect(res.header[field.toLowerCase()]).toBeFalsy();
  };

export const shouldHaveBody = (buf: any) =>
  (res: any) => {
    const body = res.body || res.text;
    expect(body).toBeTruthy();
    expect(body.toString("hex")).toEqual(buf.toString("hex"));
  };

export const shouldNotHaveBody = () =>
  (res: any) => {
    expect(res.text === "" || res.text === undefined || res.text === null)
      .toBeTruthy();
  };
