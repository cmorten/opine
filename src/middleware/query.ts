import { parseUrl } from "../utils/url.ts";
import { Request, Response, NextFunction } from "../types.ts";

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
      req.query = Object.fromEntries(parseUrl(req).searchParams);
    }

    next();
  };
};
