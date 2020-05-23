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
