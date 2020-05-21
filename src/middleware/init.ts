import { Request, Response, NextFunction } from "../../typings/index.d.ts";

const create = Object.create;

/**
 * Initialization middleware, exposing the
 * request and response to each other, setting
 * locals if not defined, as well as defaulting
 * the X-Powered-By header field.
 *
 * @return {Function} init middleware
 * @private
 */
const initMiddlewareFactory = function (app: any) {
  return function init(req: Request, res: Response, next: NextFunction) {
    res.set("X-Powered-By", "Opine");

    req.res = res;
    res.req = req;
    req.next = next;

    Object.setPrototypeOf(req, app.request);
    Object.setPrototypeOf(res, app.response);

    res.locals = res.locals || create(null);

    next();
  };
};

export default initMiddlewareFactory;
