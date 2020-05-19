import { getParsedUrl } from "../utils.ts";

/**
 * Exposes a query object containing the querystring
 * parameters of the request url.
 * 
 * @return {Function} query middleware
 * @private
 */
// TODO: feature parity with Express
const queryMiddlewareFactory = () =>
  function query(req: any, res: any, next: any) {
    /**
     * Potential perf gain moving to a bespoke JSON parse approach
     * REF: https://jsperf.com/query-string-to-js-object
     */
    if (!req.query) {
      req.query = Object.fromEntries(getParsedUrl(req).searchParams);
    }

    next();
  };

export default queryMiddlewareFactory;
