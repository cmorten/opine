import type {
  NextFunction,
  Opine,
  Request,
  Response,
} from "../../src/types.ts";

const create = Object.create;
const setPrototypeOf = Object.setPrototypeOf;

/**
 * Initialization middleware, exposing the
 * request and response to each other, setting
 * locals if not defined, as well as defaulting
 * the X-Powered-By header field.
 *
 * @param {Opine} app
 * @return {Function} init middleware
 * @private
 */
export const init = function (app: Opine) {
  return function opineInit(req: Request, res: Response, next: NextFunction) {
    if (app.enabled("x-powered-by")) res.set("X-Powered-By", "Opine");

    req.res = res;
    res.req = req;
    req.next = next;

    setPrototypeOf(req, app.request);
    setPrototypeOf(res, app.response);

    // TODO:(asos-craigmorten) why did Deno 1.9.0 result in setPrototypeOf not being sufficient
    // to populate `res` with the `app` property. Worked in Deno 1.8.3 :thinking:
    res.app = app.response.app;
    res.locals = res.locals || create(null);

    next();
  };
};
