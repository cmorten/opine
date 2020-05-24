import { parseUrl } from "../utils/parseUrl.ts";
import { Request, Response, NextFunction, ParsedURL } from "../types.ts";

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
      req.query = Object.fromEntries(url.searchParams);
    }

    next();
  };
};
