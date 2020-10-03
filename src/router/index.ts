import { setImmediate } from "../../deps.ts";
import { Route } from "./route.ts";
import { Layer } from "./layer.ts";
import { merge } from "../utils/merge.ts";
import { parseUrl } from "../utils/parseUrl.ts";
import { methods } from "../methods.ts";
import type {
  NextFunction,
  Request,
  Response,
  Router as IRouter,
  RouterConstructor,
} from "../types.ts";

const objectRegExp = /^\[object (\S+)\]$/;
const setPrototypeOf = Object.setPrototypeOf;

/**
 * Initialize a new `Router` with the given `options`.
 *
 * @param {object} options
 * @return {Router} which is an callable function
 * @public
 */
export const Router: RouterConstructor = function (options: any = {}): any {
  function router(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    (router as any).handle(req, res, next);
  }

  setPrototypeOf(router, Router);

  router.params = {};
  router._params = [] as any[];
  router.caseSensitive = options.caseSensitive;
  router.mergeParams = options.mergeParams;
  router.strict = options.strict;
  router.stack = [] as any[];

  return router as IRouter;
} as any;

/**
 * Map the given param placeholder `name`(s) to the given callback.
 *
 * Parameter mapping is used to provide pre-conditions to routes
 * which use normalized placeholders. For example a _:user_id_ parameter
 * could automatically load a user's information from the database without
 * any additional code,
 *
 * The callback uses the same signature as middleware, the only difference
 * being that the value of the placeholder is passed, in this case the _id_
 * of the user. Once the `next()` function is invoked, just like middleware
 * it will continue on to execute the route, or subsequent parameter functions.
 *
 * Just like in middleware, you must either respond to the request or call next
 * to avoid stalling the request.
 *
 *  app.param('user_id', function(req, res, next, id){
 *    User.find(id, function(err, user){
 *      if (err) {
 *        return next(err);
 *      } else if (!user) {
 *        return next(new Error('failed to load user'));
 *      }
 *      req.user = user;
 *      next();
 *    });
 *  });
 *
 * @param {String} name
 * @param {Function} fn
 * @return {app} for chaining
 * @public
 */

Router.param = function param(name, fn) {
  // apply param functions
  var params = this._params;
  var len = params.length;
  var ret;

  // ensure param `name` is a string
  if (typeof name !== "string") {
    throw new Error(
      "invalid param() call for " + name + ", value must be a string",
    );
  }

  for (var i = 0; i < len; ++i) {
    if (ret = params[i](name, fn)) {
      fn = ret;
    }
  }

  // ensure we end up with a
  // middleware function
  if ("function" !== typeof fn) {
    throw new Error("invalid param() call for " + name + ", got " + fn);
  }

  (this.params[name] = this.params[name] || []).push(fn);
  return this;
};

/**
 * Dispatch a req, res into the router.
 * @private
 */
Router.handle = function handle(
  req: Request,
  res: Response,
  out: NextFunction = () => {},
) {
  const self: any = this;

  let idx = 0;
  let protohost = getProtohost(req.url) || "";
  let removed = "";
  let slashAdded = false;
  let paramcalled = {};

  // store options for OPTIONS request
  // only used if OPTIONS request
  let options: any[] = [];

  // middleware and routes
  let stack = self.stack;

  // manage inter-router variables
  let parentParams = req.params;
  let parentUrl = req.baseUrl || "";
  let done = (restore as any)(out, req, "baseUrl", "next", "params");

  // setup next layer
  req.next = next;

  // for options requests, respond with a default if nothing else responds
  if (req.method === "OPTIONS") {
    done = wrap(done, function (old: any, err?: any): void {
      if (err || options.length === 0) {
        return old(err);
      }
      sendOptionsResponse(res, options, old);
    });
  }

  // setup basic req values
  req.baseUrl = parentUrl;
  req.originalUrl = req.originalUrl || req.url;

  next();

  function next(err?: any) {
    let layerError = err === "route" ? null : err;

    // remove added slash
    if (slashAdded) {
      req.url = req.url.substr(1);
      slashAdded = false;
    }

    // restore altered req.url
    if (removed.length !== 0) {
      req.baseUrl = parentUrl;
      req.url = protohost + removed +
        req.url.substr(protohost.length);
      removed = "";
    }

    // signal to exit router
    if (layerError === "router") {
      setImmediate(done, null);
      return;
    }

    // no more matching layers
    if (idx >= stack.length) {
      setImmediate(done, layerError);
      return;
    }

    // get pathname of request
    let path = (parseUrl(req) || {}).pathname;

    if (path == null) {
      return done(layerError);
    }

    // find next matching layer
    let layer: any;
    let match: any;
    let route: any;

    while (match !== true && idx < stack.length) {
      layer = stack[idx++];
      match = matchLayer(layer, path);
      route = layer.route;

      if (typeof match !== "boolean") {
        // hold on to layerError
        layerError = layerError || match;
      }

      if (match !== true) {
        continue;
      }

      if (!route) {
        // process non-route handlers normally
        continue;
      }

      if (layerError) {
        // routes do not match with a pending error
        match = false;
        continue;
      }

      let method = req.method;
      let has_method = route._handles_method(method);

      // build up automatic options response
      if (!has_method && method === "OPTIONS") {
        appendMethods(options, route._options());
      }

      // don't even bother matching route
      if (!has_method && method !== "HEAD") {
        match = false;
        continue;
      }
    }

    // no match
    if (match !== true) {
      return done(layerError);
    }

    // store route for dispatch on change
    if (route) {
      req.route = route;
    }

    // Capture one-time layer values
    req.params = self.mergeParams
      ? mergeParams(layer.params, parentParams)
      : layer.params;

    let layerPath = layer.path;

    // this should be done for the layer
    self.process_params(
      layer,
      paramcalled,
      req,
      res,
      function (err?: any) {
        if (err) {
          return next(layerError || err);
        }

        if (route) {
          return layer.handle_request(req, res, next);
        }

        trim_prefix(layer, layerError, layerPath, path);
      },
    );
  }

  function trim_prefix(
    layer: any,
    layerError: any,
    layerPath: any,
    path: any,
  ) {
    if (layerPath.length !== 0) {
      // Validate path breaks on a path separator
      let c = path[layerPath.length];

      if (c && c !== "/" && c !== ".") {
        return next(layerError);
      }

      // Trim off the part of the url that matches the route
      // middleware (.use stuff) needs to have the path stripped
      removed = layerPath;
      req.url = protohost +
        req.url.substr(protohost.length + removed.length);

      // Ensure leading slash
      if (!protohost && req.url[0] !== "/") {
        req.url = "/" + req.url;
        slashAdded = true;
      }

      // Setup base URL (no trailing slash)
      req.baseUrl = parentUrl +
        (removed[removed.length - 1] === "/"
          ? removed.substring(0, removed.length - 1)
          : removed);
    }

    if (layerError) {
      layer.handle_error(layerError, req, res, next);
    } else {
      layer.handle_request(req, res, next);
    }
  }
};

/**
 * Process any parameters for the layer.
 * @private
 */
Router.process_params = function process_params(
  layer: any,
  called: any,
  req: Request,
  res: Response,
  done: NextFunction,
) {
  let params = this.params;

  // captured parameters from the layer, keys and values
  let keys = layer.keys;

  // fast track
  if (!keys || keys.length === 0) {
    return done();
  }

  let i = 0;
  let name;
  let paramIndex = 0;
  let key: any;
  let paramVal: any;
  let paramCallbacks: any;
  let paramCalled: any;

  // process params in order
  // param callbacks can be async
  function param(err?: any): any {
    if (err) {
      return done(err);
    }

    if (i >= keys.length) {
      return done();
    }

    paramIndex = 0;
    key = keys[i++];
    name = key.name;
    paramVal = req.params[name];
    paramCallbacks = params[name];
    paramCalled = called[name];

    if (paramVal === undefined || !paramCallbacks) {
      return param();
    }

    // param previously called with same value or error occurred
    if (
      paramCalled && (paramCalled.match === paramVal ||
        (paramCalled.error && paramCalled.error !== "route"))
    ) {
      // restore value
      req.params[name] = paramCalled.value;

      // next param
      return param(paramCalled.error);
    }

    called[name] = paramCalled = {
      error: null,
      match: paramVal,
      value: paramVal,
    };

    paramCallback();
  }

  // single param callbacks
  function paramCallback(err?: any) {
    let fn = paramCallbacks[paramIndex++];

    // store updated value
    paramCalled.value = req.params[key.name];

    if (err) {
      // store error
      paramCalled.error = err;
      param(err);
      return;
    }

    if (!fn) return param();

    try {
      fn(req, res, paramCallback, paramVal, key.name);
    } catch (e) {
      paramCallback(e);
    }
  }

  param();
};

/**
 * Use the given middleware function, with optional path, defaulting to "/".
 *
 * Use (like `.all`) will run for any http METHOD, but it will not add
 * handlers for those methods so OPTIONS requests will not consider `.use`
 * functions even if they could respond.
 *
 * The other difference is that _route_ path is stripped and not visible
 * to the handler function. The main effect of this feature is that mounted
 * handlers can operate without any code changes regardless of the "prefix"
 * pathname.
 *
 * @public
 */
Router.use = function use(fn: any) {
  let offset = 0;
  let path = "/";

  // default path to '/'
  // disambiguate router.use([fn])
  if (typeof fn !== "function") {
    let arg: any = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== "function") {
      offset = 1;
      path = fn;
    }
  }

  let callbacks = Array.prototype.slice.call(arguments, offset).flat(1);

  if (callbacks.length === 0) {
    throw new TypeError("Router.use() requires a middleware function");
  }

  for (let i = 0; i < callbacks.length; i++) {
    let fn = callbacks[i];

    if (typeof fn !== "function") {
      throw new TypeError(
        "Router.use() requires a middleware function but got a " + gettype(fn),
      );
    }

    let layer = new (Layer as any)(path, {
      sensitive: this.caseSensitive,
      strict: false,
      end: false,
    }, fn);

    layer.route = undefined;

    this.stack.push(layer);
  }

  return this;
};

/**
 * Create a new Route for the given path.
 *
 * Each route contains a separate middleware stack and VERB handlers.
 *
 * See the Route api documentation for details on adding handlers
 * and middleware to routes.
 *
 * @param {String} path
 * @return {Route}
 * @public
 */
Router.route = function route(path: string) {
  let route = new Route(path);

  let layer = new Layer(path, {
    sensitive: this.caseSensitive,
    strict: this.strict,
    end: true,
  }, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);
  return route;
};

// create Router#VERB functions
methods.concat("all").forEach(function (method) {
  (Router as any)[method] = function (path: string) {
    let route = this.route(path);
    route[method].apply(route, Array.prototype.slice.call(arguments, 1));
    return this;
  };
});

// append methods to a list of methods
function appendMethods(list: any, addition: any) {
  for (let i = 0; i < addition.length; i++) {
    let method = addition[i];
    if (list.indexOf(method) === -1) {
      list.push(method);
    }
  }
}

// Get get protocol + host for a URL
function getProtohost(url: string) {
  if (typeof url !== "string" || url.length === 0 || url[0] === "/") {
    return undefined;
  }

  let searchIndex = url.indexOf("?");
  let pathLength = searchIndex !== -1 ? searchIndex : url.length;
  let fqdnIndex = url.substr(0, pathLength).indexOf("://");

  return fqdnIndex !== -1
    ? url.substr(0, url.indexOf("/", 3 + fqdnIndex))
    : undefined;
}

// get type for error message
function gettype(obj: any) {
  let type = typeof obj;

  if (type !== "object") {
    return type;
  }

  // inspect [[Class]] for objects
  return Object.prototype.toString.call(obj)
    .replace(objectRegExp, "$1");
}

/**
 * Match path to a layer.
 *
 * @param {Layer} layer
 * @param {string} path
 * @private
 */
function matchLayer(layer: any, path: string) {
  try {
    return layer.match(path);
  } catch (err) {
    return err;
  }
}

// merge params with parent params
function mergeParams(params: any, parent: any) {
  if (typeof parent !== "object" || !parent) {
    return params;
  }

  // make copy of parent for base
  let obj = merge({}, parent);

  // simple non-numeric merging
  if (!(0 in params) || !(0 in parent)) {
    return merge(obj, params);
  }

  let i = 0;
  let o = 0;

  // determine numeric gaps
  while (i in params) {
    i++;
  }

  while (o in parent) {
    o++;
  }

  // offset numeric indices in params before merge
  for (i--; i >= 0; i--) {
    params[i + o] = params[i];

    // create holes for the merge when necessary
    if (i < o) {
      delete params[i];
    }
  }

  return merge(obj, params);
}

// restore obj props after function
function restore(fn: Function, obj: any) {
  let props = new Array(arguments.length - 2);
  let vals = new Array(arguments.length - 2);

  for (let i = 0; i < props.length; i++) {
    props[i] = arguments[i + 2];
    vals[i] = obj[props[i]];
  }

  return function (this: any) {
    // restore vals
    for (let i = 0; i < props.length; i++) {
      obj[props[i]] = vals[i];
    }

    return fn.apply(this, arguments);
  };
}

// send an OPTIONS response
function sendOptionsResponse(res: Response, options: any, next: NextFunction) {
  try {
    let body = options.join(",");
    res.set("Allow", body);
    res.send(body);
  } catch (err) {
    next(err);
  }
}

// wrap a function
function wrap(old: any, fn: any) {
  return function proxy(this: any) {
    let args = new Array(arguments.length + 1);

    args[0] = old;
    for (let i = 0, len = arguments.length; i < len; i++) {
      args[i + 1] = arguments[i];
    }

    fn.apply(this, args);
  };
}
