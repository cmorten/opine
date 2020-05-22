/**
 * Helper function for creating a getter on an object.
 *
 * @param {object} obj
 * @param {string} name
 * @param {Function} getter
 * @private
 */
export function defineGetter(obj: object, name: string, getter: () => any) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: true,
    get: getter,
  });
}
