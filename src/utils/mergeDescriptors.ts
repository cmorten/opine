/*!
 * Adapted merge-descriptors for Deno.
 *
 * REF: https://github.com/component/merge-descriptors/blob/master/index.js
 *
 * merge-descriptors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Merge the property descriptors of `src` into `dest`
 *
 * @param {object} dest Object to add descriptors to
 * @param {object} src Object to clone descriptors from
 * @param {boolean} [redefine=true] Redefine `dest` properties with `src` properties
 * @returns {object} Reference to dest
 * @public
 */
export function mergeDescriptors(
  dest: object,
  src: object,
  redefine: boolean = true,
) {
  if (!dest) {
    throw new TypeError("argument dest is required");
  }

  if (!src) {
    throw new TypeError("argument src is required");
  }

  Object.getOwnPropertyNames(src).forEach(
    function forEachOwnPropertyName(name) {
      if (!redefine && hasOwnProperty.call(dest, name)) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(src, name);
      Object.defineProperty(dest, name, descriptor as PropertyDescriptor);
    },
  );

  return dest;
}
