import { Layer } from "./layer.ts";
import { methods } from "../methods.ts";
import type { NextFunction, Request, Response } from "../types.ts";

/**
 * Initialize `Route` with the given `path`.
 *
 * @param {string} path
 * @public
 */
export const Route: any = function Route(this: any, path: string): void {
  this.path = path;
  this.stack = [];

  // route handlers for various http methods
  this.methods = {};
};

/**
 * Determine if the route handles a given method.
 * @private
 */
Route.prototype._handles_method = function _handles_method(method: any) {
  if (this.methods._all) {
    return true;
  }

  let name = method.toLowerCase();

  if (name === "head" && !this.methods["head"]) {
    name = "get";
  }

  return Boolean(this.methods[name]);
};

/**
 * @return {Array} supported HTTP methods
 * @private
 */
Route.prototype._options = function _options() {
  let methods = Object.keys(this.methods);

  // append automatic head
  if (this.methods.get && !this.methods.head) {
    methods.push("head");
  }

  for (let i = 0; i < methods.length; i++) {
    // make upper case
    methods[i] = methods[i].toUpperCase();
  }

  return methods;
};

/**
 * dispatch req, res into this route
 * @private
 */
Route.prototype.dispatch = function dispatch(
  req: Request,
  res: Response,
  done: NextFunction,
) {
  let idx = 0;
  let stack = this.stack;
  if (stack.length === 0) {
    return done();
  }

  let method = req.method.toLowerCase();
  if (method === "head" && !this.methods["head"]) {
    method = "get";
  }

  req.route = this;

  next();

  function next(err?: Error | string): any {
    // signal to exit route
    if (err && err === "route") {
      return done();
    }

    // signal to exit router
    if (err && err === "router") {
      return done(err);
    }

    let layer = stack[idx++];
    if (!layer) {
      return done(err);
    }

    if (layer.method && layer.method !== method) {
      return next(err);
    }

    if (err) {
      layer.handle_error(err, req, res, next);
    } else {
      layer.handle_request(req, res, next);
    }
  }
};

/**
 * Add a handler for all HTTP verbs to this route.
 *
 * Behaves just like middleware and can respond or call `next`
 * to continue processing.
 *
 * You can use multiple `.all` call to add multiple handlers.
 *
 *   function check_something(req, res, next){
 *     next();
 *   };
 *
 *   function validate_user(req, res, next){
 *     next();
 *   };
 *
 *   route
 *   .all(validate_user)
 *   .all(check_something)
 *   .get(function(req, res, next){
 *     res.send('hello world');
 *   });
 *
 * @param {function} handler
 * @return {Route} for chaining
 * @public
 */
Route.prototype.all = function all() {
  let handles = Array.prototype.slice.call(arguments).flat(1);

  for (let i = 0; i < handles.length; i++) {
    let handle = handles[i];

    if (typeof handle !== "function") {
      let type = Object.prototype.toString.call(handle);
      let msg = "Route.all() requires a callback function but got a " + type;
      throw new TypeError(msg);
    }

    let layer = Layer("/", {}, handle);
    layer.method = undefined;

    this.methods._all = true;
    this.stack.push(layer);
  }

  return this;
};

methods.forEach(function (method) {
  Route.prototype[method] = function () {
    let handles = Array.prototype.slice.call(arguments).flat(1);

    for (let i = 0; i < handles.length; i++) {
      let handle = handles[i];

      if (typeof handle !== "function") {
        let type = Object.prototype.toString.call(handle);
        let msg = "Route." + method +
          "() requires a callback function but got a " + type;
        throw new Error(msg);
      }

      let layer = Layer("/", {}, handle);
      layer.method = method;

      this.methods[method] = true;
      this.stack.push(layer);
    }

    return this;
  };
});
