import { Request } from "../typings/index.d.ts";

/**
 * Merges the src object into the dest object
 * using object spread.
 * 
 * @param {object} dest
 * @param {object} src
 * @returns {object}
 * @public
 */
const merge = (dest: object, src: object): object => {
  if (dest && src) {
    return { ...dest, ...src };
  }

  return dest;
};

/**
 * Mixin.
 * 
 * @param {object} dest 
 * @param {object} src 
 * @returns {object}
 * @public
 */
const mixin = (dest: object, src: object): object => {
  Object.getOwnPropertyNames(src).forEach(
    (name) => {
      if (Object.prototype.hasOwnProperty.call(dest, name)) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(src, name);
      Object.defineProperty(dest, name, descriptor as PropertyDescriptor);
    },
  );

  return dest;
};

/**
 * Extracts the url from a Deno request object and
 * returns a URL object with memoization.
 * 
 * @param {Request} req
 * @returns {URL}
 * @public 
 */
const getParsedUrl = (req: Request): URL => {
  if (req._parsedUrl) {
    return req._parsedUrl;
  }

  req._parsedUrl = new URL(
    `${req.proto.split("/")[0].toLowerCase()}://${
      req.headers.get("host")
    }${req.url}`,
  );

  return req._parsedUrl;
};

/**
 * Module exports.
 * @public
 */
export { merge, mixin, getParsedUrl };
