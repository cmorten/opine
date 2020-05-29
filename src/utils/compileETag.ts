import { etag as createETag } from "./etag.ts";

/**
 * Create an ETag generator function, generating ETags with
 * the given options.
 *
 * @param {object} options
 * @return {Function} generateETag function.
 * @private
 */
function createETagGenerator(options: any): Function {
  return function generateETag(body: string | Uint8Array | Deno.FileInfo) {
    return createETag(body, options);
  };
}

/**
 * Return strong ETag for `body`.
 *
 * @param {any} body
 * @param {string} [encoding]
 * @return {string}
 * @private
 */
export const etag = createETagGenerator({ weak: false });

/**
 * Return weak ETag for `body`.
 *
 * @param {any} body
 * @param {string} [encoding]
 * @return {string}
 * @private
 */
export const wetag = createETagGenerator({ weak: true });

/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @private
 */
export const compileETag = function (value: any) {
  let fn;

  if (typeof value === "function") {
    return value;
  }

  switch (value) {
    case true:
      fn = wetag;
      break;
    case false:
      break;
    case "strong":
      fn = etag;
      break;
    case "weak":
      fn = wetag;
      break;
    default:
      throw new TypeError(`unknown value for etag function: ${value}`);
  }

  return fn;
};
