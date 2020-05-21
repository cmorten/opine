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
 * returns a full URL string with memoization.
 * 
 * @param {Request} req 
 * @returns {string}
 * @public
 */
const getFullUrl = (req: Request): string => {
  const proto = req.proto ? `${req.proto.split("/")[0].toLowerCase()}://` : "";
  const host = req.headers.get("host") || "";
  const path = req.url;

  req._url = `${proto}${host}${path}`;

  return req._url;
};

type ParsedURL = URL & { _raw?: string; _url?: string };

const fresh = (
  url: string,
  parsedUrl: ParsedURL | undefined,
): boolean => {
  return !!parsedUrl && parsedUrl._raw === url;
};

/**
 * Extracts the url from a Deno request object and
 * returns a URL object with memoization.
 * 
 * As a side-effect, the URL object is stored on the
 * request object under `_parsedUrl`.
 * 
 * @param {Request} req
 * @returns {URL}
 * @public 
 */
const parseUrl = (req: Request): ParsedURL => {
  const url = req.url;
  const parsedUrl = req._parsedUrl;

  if (fresh(url, parsedUrl)) {
    return parsedUrl as ParsedURL;
  }

  req._raw = req.url;
  req._parsedUrl = new URL(getFullUrl(req));

  return req._parsedUrl;
};

/**
 * Module exports.
 * @public
 */
export { merge, mixin, parseUrl, getFullUrl, ParsedURL };
