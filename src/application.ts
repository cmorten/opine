import {
  serve,
  serveTLS,
  HTTPSOptions,
  HTTPOptions,
  Server,
} from "../deps.ts";
import { methods } from "./methods.ts";
import { Router } from "./router/index.ts";
import { init } from "./middleware/init.ts";
import { query } from "./middleware/query.ts";
import { Response as ServerResponse } from "./response.ts";
import { finalHandler } from "./utils/finalHandler.ts";
import { compileETag } from "./utils/compileETag.ts";
import {
  Request,
  Response,
  NextFunction,
  Application,
  PathParams,
  IRoute,
  Opine,
  Router as IRouter,
} from "../src/types.ts";

const create = Object.create;
const setPrototypeOf = Object.setPrototypeOf;
const slice = Array.prototype.slice;

// TODO: move app over to class based?

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
  // TODO: env
  // TODO: query parser
  // TODO: subdomain offset
  // TODO: trust proxy

  const self: Opine = this as Opine;
  this.on("mount", function onmount(parent: Opine) {
    // TODO: trust proxy

    // inherit prototypes
    setPrototypeOf(self.request, parent.request);
    setPrototypeOf(self.response, parent.response);
    setPrototypeOf(self.settings, parent.settings);
  });

  // setup locals
  this.locals = create(null);

  // top-most app is mounted at /
  this.mountpath = "/";

  // default locals
  this.locals.settings = this.settings;

  // TODO: views
  this.set("jsonp callback name", "callback");
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
    // TODO: query parser
    this._router.use(query());
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

  next = next || finalHandler(req, res);

  if (!router) {
    return next();
  }

  router.handle(req, res, next);
};

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
  const [path, ...nonPathArgs] = typeof args[0] !== "function"
    ? args
    : ["/", ...args];
  const fns = nonPathArgs.flat(1);

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

// TODO: app.engine()

// TODO: app.param()

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

// TODO: app.render()

// TODO: consider adding optional callback to ease Express transition.
// TODO: consider using a Proxy to enable setting / getting of `req.body`.
/**
 * Listen for connections.
 *
 * @param {number|string|HTTPOptions|HTTPSOptions} options
 * @returns {Server} Configured Deno server
 * @public
 */
app.listen = function listen(
  options: number | string | HTTPOptions | HTTPSOptions,
  callback?: Function,
): Server {
  if (typeof options === "number") {
    options = `:${options}`;
  }

  const isTlsOptions = typeof options !== "string" &&
    typeof (options as HTTPSOptions).certFile !== "undefined";

  const server = isTlsOptions
    ? serveTLS(options as HTTPSOptions)
    : serve(options);

  const start = async () => {
    for await (const request of server) {
      this(request as Request, new ServerResponse());
    }
  };

  start();

  if (callback && typeof callback === "function") callback();

  return server;
};
