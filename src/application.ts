import {
  fromFileUrl,
  HTTPOptions,
  HTTPSOptions,
  resolve,
  serve,
  Server,
  serveTLS,
} from "../deps.ts";
import { methods } from "./methods.ts";
import { Router } from "./router/index.ts";
import { init } from "./middleware/init.ts";
import { query } from "./middleware/query.ts";
import { requestProxy } from "./utils/requestProxy.ts";
import { finalHandler } from "./utils/finalHandler.ts";
import { compileETag } from "./utils/compileETag.ts";
import { compileQueryParser } from "./utils/compileQueryParser.ts";
import { compileTrust } from "./utils/compileTrust.ts";
import { merge } from "./utils/merge.ts";
import { View } from "./view.ts";
import type {
  Application,
  IRoute,
  NextFunction,
  Opine,
  PathParams,
  Request,
  Response,
} from "../src/types.ts";

const create = Object.create;
const setPrototypeOf = Object.setPrototypeOf;
const slice = Array.prototype.slice;

/**
 * Variable for trust proxy inheritance
 * @private
 */
const trustProxyDefaultSymbol = "@@symbol:trust_proxy_default";

/**
 * Application prototype.
 * 
 * @public
 */
export const app: Application = {} as Application;

/**
 * Initialize the server.
 *
 *   - setup default configuration
 *   - setup default middleware
 *   - setup route reflection methods
 *
 * @private
 */
app.init = function init(): void {
  this.cache = {};
  this.engines = {};
  this.settings = {};

  this.defaultConfiguration();
};

/**
 * Initialize application configuration.
 * @private
 */
app.defaultConfiguration = function defaultConfiguration(): void {
  this.enable("x-powered-by");
  this.set("etag", "weak");
  this.set("query parser", "extended");
  this.set("subdomain offset", 2);
  this.set("trust proxy", false);

  // trust proxy inherit
  Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
    configurable: true,
    value: true,
  });

  const self: Opine = this as Opine;
  this.on("mount", function onmount(parent: Opine) {
    // inherit trust proxy
    if (
      self.settings[trustProxyDefaultSymbol] === true &&
      typeof parent.settings["trust proxy fn"] === "function"
    ) {
      delete self.settings["trust proxy"];
      delete self.settings["trust proxy fn"];
    }

    // inherit prototypes
    setPrototypeOf(self.request, parent.request);
    setPrototypeOf(self.response, parent.response);
    setPrototypeOf(self.engines, parent.engines);
    setPrototypeOf(self.settings, parent.settings);
  });

  // setup locals
  this.locals = create(null);

  // top-most app is mounted at /
  this.mountpath = "/";

  // default locals
  this.locals.settings = this.settings;

  // default configuration
  this.set("view", View);
  this.set("views", resolve("views"));
  this.set("jsonp callback name", "callback");
  this.enable("view cache");
};

/**
 * Lazily adds the base router if it has not yet been added.
 *
 * We cannot add the base router in the defaultConfiguration because
 * it reads app settings which might be set after that has run.
 *
 * @private
 */
app.lazyrouter = function lazyrouter(): void {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled("case sensitive routing"),
      strict: this.enabled("strict routing"),
    });

    this._router.use(query(this.get("query parser fn")));
    this._router.use(init(this as Opine));
  }
};

/**
 * Dispatch a req, res pair into the application. Starts pipeline processing.
 *
 * If no callback is provided, then default error handlers will respond
 * in the event of an error bubbling through the stack.
 *
 * @private
 */
app.handle = function handle(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const router = this._router;

  req = requestProxy(req);

  next = next || finalHandler(req, res);

  if (!router) {
    return next();
  }

  router.handle(req, res, next);
};

const isPath = (thing: any) =>
  typeof thing === "string" || thing instanceof RegExp;

/**
 * Proxy `Router#use()` to add middleware to the app router.
 * See Router#use() documentation for details.
 *
 * If the _fn_ parameter is an opine app, then it will be
 * mounted at the _route_ specified.
 *
 * @returns {Application} for chaining
 * @public
 */
app.use = function use(...args: any[]): Application {
  const firstArg = args[0];
  const [path, ...nonPathArgs] =
    (Array.isArray(firstArg) ? isPath(firstArg[0]) : isPath(firstArg))
      ? args
      : ["/", ...args];
  const fns = nonPathArgs.flat(Infinity);

  if (fns.length === 0) {
    throw new TypeError("app.use() requires a middleware function");
  }

  // setup router
  this.lazyrouter();
  const router = this._router;

  fns.forEach(function (this: Application, fn: any) {
    // non-opine app
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }

    fn.mountpath = path;
    fn.parent = this;

    router.use(
      path,
      function mounted_app(
        req: Request,
        res: Response,
        next: NextFunction,
      ): void {
        const orig = req.app as Opine;

        fn.handle(req, res, (err?: Error) => {
          setPrototypeOf(req, orig.request);
          setPrototypeOf(res, orig.response);
          next(err);
        });
      },
    );

    // mounted an app
    fn.emit("mount", this);
  }, this);

  return this;
};

/**
 * Proxy to the app `Router#route()`
 * Returns a new `Route` instance for the _path_.
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the Route api docs for details.
 *
 * @param {PathParams} prefix
 * @returns {Route}
 * @public
 */
app.route = function route(prefix: PathParams): IRoute {
  this.lazyrouter();
  return this._router.route(prefix);
};

/**
 * Register the given template engine callback `fn` for the
 * provided extension `ext`.
 *
 * @param {string} ext
 * @param {Function} fn
 * @return {Application} for chaining
 * @public
 */
app.engine = function engine(ext: string, fn: Function) {
  const extension = ext[0] !== "." ? `.${ext}` : ext;
  this.engines[extension] = fn;

  return this;
};

/**
 * Proxy to `Router#param()` with one added api feature. The _name_ parameter
 * can be an array of names.
 *
 * See the Router#param() docs for more details.
 *
 * @param {String|Array} name
 * @param {Function} fn
 * @return {app} for chaining
 * @public
 */

app.param = function param(name, fn) {
  this.lazyrouter();
  if (Array.isArray(name)) {
    for (var i = 0; i < name.length; i++) {
      this.param(name[i], fn);
    }
    return this;
  }
  this._router.param(name, fn);
  return this;
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    app.set('foo', 'bar');
 *    app.set('foo');
 *    // => "bar"
 *
 * Mounted servers inherit their parent server's settings.
 *
 * @param {string} setting
 * @param {any} value
 * @return {Application} for chaining
 * @public
 */
app.set = function set(setting: string, value?: any): Application {
  if (arguments.length === 1) {
    // app.get(setting)
    return this.settings[setting];
  }

  this.settings[setting] = value;

  // trigger matched settings
  switch (setting) {
    case "etag":
      this.set("etag fn", compileETag(value));
      break;
    case "query parser":
      this.set("query parser fn", compileQueryParser(value));
      break;
    case "trust proxy":
      this.set("trust proxy fn", compileTrust(value));

      // trust proxy inherit
      Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
        configurable: true,
        value: false,
      });

      break;
  }

  return this;
};

/**
 * Return the app's absolute pathname
 * based on the parent(s) that have
 * mounted it.
 *
 * For example if the application was
 * mounted as "/admin", which itself
 * was mounted as "/blog" then the
 * return value would be "/blog/admin".
 *
 * @return {string}
 * @private
 */
app.path = function path(): string {
  return this.parent ? this.parent.path() + this.mountpath : "";
};

/**
 * Check if `setting` is enabled (truthy).
 *
 *    app.enabled('foo')
 *    // => false
 *
 *    app.enable('foo')
 *    app.enabled('foo')
 *    // => true
 *
 * @param {string} setting
 * @return {boolean}
 * @public
 */
app.enabled = function enabled(setting: string): boolean {
  return Boolean(this.set(setting));
};

/**
 * Check if `setting` is disabled.
 *
 *    app.disabled('foo')
 *    // => true
 *
 *    app.enable('foo')
 *    app.disabled('foo')
 *    // => false
 *
 * @param {string} setting
 * @return {boolean}
 * @public
 */
app.disabled = function disabled(setting: string): boolean {
  return !this.set(setting);
};

/**
 * Enable `setting`.
 *
 * @param {string} setting
 * @return {Application} for chaining
 * @public
 */
app.enable = function enable(setting: string): Application {
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {string} setting
 * @return {Application} for chaining
 * @public
 */
app.disable = function disable(setting: string): Application {
  return this.set(setting, false);
};

/**
 * Delegate `.VERB(...)` calls to `router.VERB(...)`.
 */
methods.forEach((method: string): void => {
  (app as any)[method] = function (path: string): Application {
    if (method === "get" && arguments.length === 1) {
      // app.get(setting)
      return this.set(path);
    }

    this.lazyrouter();

    const route = this._router.route(path);
    route[method].apply(route, slice.call(arguments, 1));

    return this;
  };
});

/**
 * Special-cased "all" method, applying the given route `path`,
 * middleware, and callback to _every_ HTTP method.
 *
 * @return {Application} for chaining
 * @public
 */
app.all = function all(path: PathParams): Application {
  this.lazyrouter();

  const route = this._router.route(path);
  const args = slice.call(arguments, 1);

  for (let i = 0; i < methods.length; i++) {
    (route as any)[methods[i]].apply(route, args);
  }

  return this;
};

/**
 * Try rendering a view.
 * @private
 */
async function tryRender(view: any, options: any, callback: Function) {
  try {
    await view.render(options, callback);
  } catch (err) {
    callback(err);
  }
}

/**
 * Render the given view `name` name with `options`
 * and a callback accepting an error and the
 * rendered template string.
 *
 * Example:
 *
 *    app.render('email', { name: 'Deno' }, function(err, html) {
 *      // ...
 *    })
 *
 * @param {string} name
 * @param {Object|Function} options or callback
 * @param {Function} callback
 * @public
 */
app.render = function render(
  name: string,
  options: any,
  callback: Function = () => {},
) {
  const cache = this.cache;
  const engines = this.engines;
  const renderOptions: any = {};
  let done = callback;
  let view;

  name = name.startsWith("file:") ? fromFileUrl(name) : name;

  // support callback function as second arg
  if (typeof options === "function") {
    done = options;
    options = {};
  }

  // merge app.locals
  merge(renderOptions, this.locals);

  // merge options._locals
  if (options._locals) {
    merge(renderOptions, options._locals);
  }

  // merge options
  merge(renderOptions, options);

  // set .cache unless explicitly provided
  if (renderOptions.cache == null) {
    renderOptions.cache = this.enabled("view cache");
  }

  // primed cache
  if (renderOptions.cache) {
    view = cache[name];
  }

  // view
  if (!view) {
    const View = this.get("view");

    view = new View(name, {
      defaultEngine: this.get("view engine"),
      engines,
      root: this.get("views"),
    });

    if (!view.path) {
      const dirs = Array.isArray(view.root) && view.root.length > 1
        ? `directories "${view.root.slice(0, -1).join('", "')}" or "${
          view.root[view.root.length - 1]
        }"`
        : `directory "${view.root}"`;

      const err = new Error(
        `Failed to lookup view "${name}" in views ${dirs}`,
      );

      (err as any).view = view;

      return done(err);
    }

    // prime the cache
    if (renderOptions.cache) {
      cache[name] = view;
    }
  }

  // render
  tryRender(view, renderOptions, done);
};

/**
 * Listen for connections.
 *
 * @param {number|string|HTTPOptions|HTTPSOptions} options
 * @returns {Server} Configured Deno server
 * @public
 */
app.listen = function listen(
  options?: number | string | HTTPOptions | HTTPSOptions,
  callback?: Function,
): Server {
  if (typeof options === "undefined") {
    options = { port: 0 };
  } else if (typeof options === "number") {
    options = `:${options}`;
  }

  const isTlsOptions = typeof options !== "string" &&
    typeof (options as HTTPSOptions).certFile !== "undefined";

  const server = isTlsOptions
    ? serveTLS(options as HTTPSOptions)
    : serve(options);

  const start = async () => {
    try {
      for await (const request of server) {
        this(request as Request);
      }
    } catch (serverError) {
      if (server) {
        try {
          server.close();
        } catch (err) {
          // Server might have been already closed
          if (!(err instanceof Deno.errors.BadResource)) {
            throw err;
          }
        }
      }

      throw serverError;
    }
  };

  start();

  if (callback && typeof callback === "function") callback();

  return server;
};
