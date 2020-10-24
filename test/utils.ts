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
export async function describe(_name: string, fn: () => void | Promise<void>) {
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
    let done: any = (err?: any) => {
      if (err) throw err;
    };
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

      done = (err?: any) => {
        clearTimeout(timeoutId);
        resolve();
        if (err) throw err;
      };
    }

    await fn(done);
    await race;
  });
}

export const after = (count: number, done: Function) => {
  let _count = 0;

  return (err?: any) => {
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
 * @param obj 
 * @param props 
 */
export function pick<
  T extends Object,
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
export function omit<T extends Object, K extends keyof T>(
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
