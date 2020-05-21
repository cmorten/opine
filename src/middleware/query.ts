import { parseUrl } from "../utils.ts";
import { Request, Response, NextFunction } from "../../typings/index.d.ts";

/**
 * Exposes a query object containing the querystring
 * parameters of the request url.
 * 
 * @return {Function} query middleware
 * @private
 */
// TODO: feature parity with Express
const queryMiddlewareFactory = function () {
  return function query(req: Request, _res: Response, next: NextFunction) {
    if (!req.query) {
      req.query = Object.fromEntries(parseUrl(req).searchParams);
    }

    next();
  };
};

export default queryMiddlewareFactory;
