/**
 * Adapted from https://github.com/jaredhanson/utils-merge/blob/master/index.js for Deno.
 */

/**
 * Merge object b with object a.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {object} a
 * @param {object} b
 * @return {object}
 * @public
 */
export function merge(a: any, b: any) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}
