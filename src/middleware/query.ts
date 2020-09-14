import { parseUrl } from "../utils/parseUrl.ts";
import { fromMap } from "../utils/fromMap.ts";
import type { Request, Response, NextFunction, ParsedURL } from "../types.ts";

// TODO: back-compat support for Express signature. Namely an
// `options` parameter allowing for custom query parsers.
/**
 * Exposes a query object containing the querystring
 * parameters of the request url.
 * 
 * @return {Function} query middleware
 * @public
 */
export const query = function () {
  return function opineQuery(req: Request, _res: Response, next: NextFunction) {
    if (!req.query) {
      const url = parseUrl(req) as ParsedURL;
      req.query = fromMap(url.searchParams as any);
    }

    next();
  };
};
