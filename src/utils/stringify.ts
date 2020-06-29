/**
 * Stringify JSON, like JSON.stringify, but v8 optimized, with the
 * ability to escape characters that can trigger HTML sniffing.
 *
 * @param {any} value
 * @param {Function} replaces
 * @param {number} spaces
 * @param {boolean} escape
 * @returns {string}
 * @public
 */
export function stringify(
  value: any,
  replacer: any,
  spaces: number,
  escape: boolean,
): string {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  let json = replacer || spaces
    ? JSON.stringify(value, replacer, spaces)
    : JSON.stringify(value);

  if (escape) {
    json = json.replace(/[<>&]/g, function (c) {
      switch (c.charCodeAt(0)) {
        case 0x3c:
          return "\\u003c";
        case 0x3e:
          return "\\u003e";
        case 0x26:
          return "\\u0026";
        /* istanbul ignore next: unreachable default */
        default:
          return c;
      }
    });
  }

  return json;
}
