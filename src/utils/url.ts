import { Request, ParsedURL } from "../types.ts";

/**
 * Extracts the url from a Deno request object and
 * returns a full URL string with memoization.
 * 
 * @param {Request} req 
 * @returns {string}
 * @public
 */
export const getFullUrl = (req: Request): string => {
  const proto = req.proto ? `${req.proto.split("/")[0].toLowerCase()}://` : "";
  const host = req.headers.get("host") || "";
  const path = req.url;

  req._url = `${proto}${host}${path}`;

  return req._url;
};

/**
 * Extracts the url from a Deno request object and
 * returns a URL object with memoization.
 * 
 * As a side-effect, the URL object is stored on the
 * request object under `_parsedUrl`.
 * 
 * @param {Request} req
 * @returns {ParsedURL}
 * @public 
 */
export const parseUrl = (req: Request): ParsedURL => {
  const url = req.url;
  const parsedUrl = req._parsedUrl;

  if (parsedUrl && parsedUrl._raw === url) {
    return parsedUrl;
  }

  req._parsedUrl = new URL(getFullUrl(req));
  req._parsedUrl._raw = url;

  return req._parsedUrl;
};
