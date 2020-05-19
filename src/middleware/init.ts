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
const initMiddlewareFactory = () =>
  function init(req: any, res: any, next: any) {
    res.set("X-Powered-By", "Opine");

    req.res = res;
    req.next = next;
    res.req = req;
    res.locals = res.locals || create(null);

    next();
  };

export default initMiddlewareFactory;
