/**
 * Merge object b with object a.
 *
 * @param {object} a
 * @param {object} b
 * @return {object}
 * @public
 */
export function merge(a: any, b: any): any {
  if (a && b) {
    for (let key in b) {
      a[key] = b[key];
    }
  }

  return a;
}
