// Type definitions for Opine
// Definitions by: Craig Morten <https://github.com/asos-craigmorten>
// TODO: consider integrating these types into the app files themselves
// rather than having a separate file.

import {
  ServerRequest as DenoServerRequest,
  Response as DenoServerResponse,
  Server,
  HTTPOptions,
  HTTPSOptions,
  Status,
  Cookie as DenoCookie,
} from "../deps.ts";

declare global {
  namespace Opine {
    // These open interfaces may be extended in an application-specific manner via declaration merging.
    interface Request {}
    interface Response {}
    interface Application {}
  }
}

export type DenoResponseBody = string | Uint8Array | Deno.Reader;
export type ResponseBody = number | boolean | object | DenoResponseBody;

export interface Cookie extends DenoCookie {}

export interface NextFunction {
  (err?: any): void;
  /**
   * "Break-out" of a router by calling {next('router')};
   */
  (deferToNext: "router"): void;
}

export interface Dictionary<T> {
  [key: string]: T;
}

export interface ParamsDictionary {
  [key: string]: string;
}
export type ParamsArray = string[];
export type Params = ParamsDictionary | ParamsArray;

export interface RequestHandler<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqQuery = any,
> {
  (
    req: Request<P, ResBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ): any;
}

export type ErrorRequestHandler<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqQuery = any,
> = (
  err: any,
  req: Request<P, ResBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction,
) => any;

export type PathParams = string | RegExp | Array<string | RegExp>;

export type RequestHandlerParams<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqQuery = any,
> =
  | RequestHandler<P, ResBody, ReqQuery>
  | ErrorRequestHandler<P, ResBody, ReqQuery>
  | Array<
    | RequestHandler<P>
    | ErrorRequestHandler<P>
  >;

export interface IRouterMatcher<
  T,
  Method extends
    | "all"
    | "get"
    | "post"
    | "put"
    | "delete"
    | "patch"
    | "options"
    | "head" = any,
> {
  <
    P extends Params = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
  >(
    path: PathParams,
    ...handlers: Array<RequestHandler<P, ResBody, ReqQuery>>
  ): T;
  <
    P extends Params = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
  >(
    path: PathParams,
    ...handlers: Array<RequestHandlerParams<P, ResBody>>
  ): T;
  (path: PathParams, subApplication: Application): T;
}

export interface IRouterHandler<T> {
  (...handlers: RequestHandler[]): T;
  (...handlers: RequestHandlerParams[]): T;
}

export interface IRouter {
  /**
   * Special-cased "all" method, applying the given route `path`,
   * middleware, and callback to _every_ HTTP method.
   */
  all: IRouterMatcher<this, "all">;
  get: IRouterMatcher<this, "get">;
  post: IRouterMatcher<this, "post">;
  put: IRouterMatcher<this, "put">;
  delete: IRouterMatcher<this, "delete">;
  patch: IRouterMatcher<this, "patch">;
  options: IRouterMatcher<this, "options">;
  head: IRouterMatcher<this, "head">;

  checkout: IRouterMatcher<this>;
  connect: IRouterMatcher<this>;
  copy: IRouterMatcher<this>;
  lock: IRouterMatcher<this>;
  merge: IRouterMatcher<this>;
  mkactivity: IRouterMatcher<this>;
  mkcol: IRouterMatcher<this>;
  move: IRouterMatcher<this>;
  "m-search": IRouterMatcher<this>;
  notify: IRouterMatcher<this>;
  propfind: IRouterMatcher<this>;
  proppatch: IRouterMatcher<this>;
  purge: IRouterMatcher<this>;
  report: IRouterMatcher<this>;
  search: IRouterMatcher<this>;
  subscribe: IRouterMatcher<this>;
  trace: IRouterMatcher<this>;
  unlock: IRouterMatcher<this>;
  unsubscribe: IRouterMatcher<this>;

  use: IRouterHandler<this> & IRouterMatcher<this>;

  route(prefix: PathParams): IRoute;

  /**
   * Dispatch a req, res pair into the application. Starts pipeline processing.
   *
   * If no callback is provided, then default error handlers will respond
   * in the event of an error bubbling through the stack.
   * 
   * @private
   */
  handle(req: Request, res: Response, next?: NextFunction): void;

  /**
   * @private
   */
  process_params(
    layer: any,
    called: any,
    req: Request,
    res: Response,
    done: NextFunction,
  ): void;

  params: any;
  _params: any[];

  caseSensitive: boolean;
  mergeParams: boolean;
  strict: boolean;

  /**
   * Stack of configured routes
   */
  stack: any[];
}

export interface IRoute {
  path: string;
  stack: any;
  all: IRouterHandler<this>;
  get: IRouterHandler<this>;
  post: IRouterHandler<this>;
  put: IRouterHandler<this>;
  delete: IRouterHandler<this>;
  patch: IRouterHandler<this>;
  options: IRouterHandler<this>;
  head: IRouterHandler<this>;

  checkout: IRouterHandler<this>;
  copy: IRouterHandler<this>;
  lock: IRouterHandler<this>;
  merge: IRouterHandler<this>;
  mkactivity: IRouterHandler<this>;
  mkcol: IRouterHandler<this>;
  move: IRouterHandler<this>;
  "m-search": IRouterHandler<this>;
  notify: IRouterHandler<this>;
  purge: IRouterHandler<this>;
  report: IRouterHandler<this>;
  search: IRouterHandler<this>;
  subscribe: IRouterHandler<this>;
  trace: IRouterHandler<this>;
  unlock: IRouterHandler<this>;
  unsubscribe: IRouterHandler<this>;

  dispatch: RequestHandler;
}

export interface Router extends IRouter, RequestHandler {}

export interface RouterOptions {
  caseSensitive?: boolean;
  mergeParams?: boolean;
  strict?: boolean;
}

export interface RouterConstructor extends IRouter {
  new (options?: RouterOptions): Router;
  (options?: RouterOptions): Router;
}

export interface ByteRange {
  start: number;
  end: number;
}

export interface RequestRanges {}

export type Errback = (err: Error) => void;

export type ParsedURL = URL & {
  path?: string | null;
  query?: string | null;
  _raw?: string | null;
};

/**
 * @param P  For most requests, this should be `ParamsDictionary`, but if you're
 * using this in a route handler for a route that uses a `RegExp` or a wildcard
 * `string` path (e.g. `'/user/*'`), then `req.params` will be an array, in
 * which case you should use `ParamsArray` instead.
 *
 * @see https://expressjs.com/en/api.html#req.params
 *
 * @example
 *     app.get('/user/:id', (req, res) => res.send(req.params.id)); // implicitly `ParamsDictionary`
 *     app.get<ParamsArray>(/user\/(.*)/, (req, res) => res.send(req.params[0]));
 *     app.get<ParamsArray>('/user/*', (req, res) => res.send(req.params[0]));
 */
export interface Request<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqQuery = any,
> extends DenoServerRequest, Opine.Request {
  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     req.get('Content-Type');
   *     // => "text/plain"
   *
   *     req.get('content-type');
   *     // => "text/plain"
   *
   *     req.get('Something');
   *     // => undefined
   */
  get: (name: string) => string;

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   */
  fresh: boolean;

  params: P;

  query: ReqQuery;

  route: any;

  originalUrl: string;

  baseUrl: string;

  app: Application;

  /**
   * After middleware.init executed, Request will contain res and next properties.
   * See: opine/src/middleware/init.ts
   */
  res?: Response<ResBody>;
  next?: NextFunction;

  _url?: string;
  _parsedUrl?: ParsedURL;
  _parsedOriginalUrl?: ParsedURL;

  parsedBody?: any;
}

export interface MediaType {
  value: string;
  quality: number;
  type: string;
  subtype: string;
}

export type Send<ResBody = any, T = Response<ResBody>> = (body?: ResBody) => T;

export interface Response<ResBody = any>
  extends DenoServerResponse, Opine.Response {
  app: Application;

  req?: Request;

  locals: any;

  statusMessage?: any;

  /**
   * Appends the specified value to the HTTP response header field.
   * If the header is not already set, it creates the header with the specified value.
   * The value parameter can be a string or an array.
   *
   * Note: calling res.set() after res.append() will reset the previously-set header value.
   */
  append(field: string, value: string): this;

  /**
   * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
   */
  attachment(filename?: string): this;

  /**
   * Sets a cookie.
   *
   * Examples:
   *
   *    // "Remember Me" for 15 minutes
   *    res.cookie({ name: "rememberme", value: "1", expires: new Date(Date.now() + 900000), httpOnly: true });
   */
  cookie(cookie: Cookie): this;

  /** Clear cookie by `name`. */
  clearCookie(cookie: string): this;
  /** Clear the provided cookie. */
  clearCookie(cookie: Cookie): this;

  /**
   * Transfer the file at the given `path` as an attachment.
   *
   * Optionally providing an alternate attachment `filename`.
   *
   * This method uses `res.sendfile()`.
   */
  download(path: string): Promise<this | void>;
  download(path: string, filename: string): Promise<this | void>;

  /**
   * Ends a response.
   * 
   * Generally it is recommended to use the `res.send()` or
   * `res.json()` methods which will handle automatically
   * setting the _Content-Type_ header, and are able to
   * gracefully handle a greater range of body inputs.
   *
   * Examples:
   *
   *     res.end();
   *     res.end('<p>some html</p>');
   *     res.setStatus(404).end('Sorry, cant find that');
   */
  end(): Promise<void>;
  end(body: DenoResponseBody): Promise<void>;

  /** Get value for header `field`. */
  get(field: string): string;

  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'tj' });
   *     res.setStatus(500).json('oh noes!');
   *     res.setStatus(404).json(`I don't have that`);
   */
  json: Send<ResBody, this>;

  /**
   * Send JSON response with JSONP callback support.
   *
   * Examples:
   *
   *     res.jsonp(null);
   *     res.jsonp({ user: 'tj' });
   *     res.setStatus(500).jsonp('oh noes!');
   *     res.setStatus(404).jsonp(`I don't have that`);
   */
  jsonp: Send<ResBody, this>;

  /**
   * Set Link header field with the given `links`.
   *
   * Examples:
   *
   *    res.links({
   *      next: 'http://api.example.com/users?page=2',
   *      last: 'http://api.example.com/users?page=5'
   *    });
   */
  links(links: any): this;

  /**
   * Set the location header to `url`.
   *
   * The given `url` can also be the name of a mapped url, for
   * example by default express supports "back" which redirects
   * to the _Referrer_ or _Referer_ headers or "/".
   *
   * Examples:
   *
   *    res.location('/foo/bar').;
   *    res.location('http://example.com');
   *    res.location('../login'); // /blog/post/1 -> /blog/login
   *
   * Mounting:
   *
   *   When an application is mounted and `res.location()`
   *   is given a path that does _not_ lead with "/" it becomes
   *   relative to the mount-point. For example if the application
   *   is mounted at "/blog", the following would become "/blog/login".
   *
   *      res.location('login');
   *
   *   While the leading slash would result in a location of "/login":
   *
   *      res.location('/login');
   */
  location(url: string): this;

  /**
   * Send a response.
   *
   * Examples:
   *
   *     res.send(new Buffer('wahoo'));
   *     res.send({ some: 'json' });
   *     res.send('<p>some html</p>');
   *     res.setStatus(404).send('Sorry, cant find that');
   */
  send: Send<ResBody, this>;

  /**
   * Transfer the file at the given `path`.
   *
   * Automatically sets the _Content-Type_ response header field.
   *
   * Examples:
   *
   *  The following example illustrates how `res.sendFile()` may
   *  be used as an alternative for the `static()` middleware for
   *  dynamic situations. The code backing `res.sendFile()` is actually
   *  the same code, so HTTP cache support etc is identical.
   *
   *     app.get('/user/:uid/photos/:file', function(req, res){
   *       const uid = req.params.uid;
   *       const file = req.params.file;
   *
   *       req.user.mayViewFilesFrom(uid, function(yes) {
   *         if (yes) {
   *           res.sendFile('/uploads/' + uid + '/' + file);
   *         } else {
   *           res.send(403, 'Sorry! you cant see that.');
   *         }
   *       });
   *     });
   */
  sendFile(path: string): Promise<this>;

  /**
   * Set the response HTTP status code to `statusCode` and send its string representation as the response body.
   *
   * Examples:
   *
   *    res.sendStatus(200); // equivalent to res.setStatus(200).send('OK')
   *    res.sendStatus(403); // equivalent to res.setStatus(403).send('Forbidden')
   *    res.sendStatus(404); // equivalent to res.setStatus(404).send('Not Found')
   *    res.sendStatus(500); // equivalent to res.setStatus(500).send('Internal Server Error')
   */
  sendStatus(code: Status): this;

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    res.set('Accept', 'application/json');s
   */
  set(field: string, value: string): this;

  /**
   * Set status `code`.
   */
  setStatus(code: Status): this;

  /**
   * Set _Content-Type_ response header with `type`.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   */
  type(type: string): this;

  /**
   * Removes the header `field`.
   *
   * Examples:
   *
   *    res.unset('Accept');
   */
  unset(field: string): this;
}

export interface Handler extends RequestHandler {}

export type RequestParamHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  value: any,
  name: string,
) => any;

export type ApplicationRequestHandler<T> =
  & IRouterHandler<T>
  & IRouterMatcher<T>
  & ((...handlers: RequestHandlerParams[]) => T);

export interface Application extends IRouter, Opine.Application {
  /**
   * Opine instance itself is a request handler, which could be invoked without
   * third argument.
   */
  (
    req: Request,
    res: Response,
  ): void;

  /**
   * Initialize the server.
   *
   *   - setup default configuration
   *   - setup default middleware
   *   - setup route reflection methods
   */
  init(): void;

  /**
   * Initialize application configuration.
   */
  defaultConfiguration(): void;

  /**
   * Lazily adds the base router if it has not yet been added.
   *
   * We cannot add the base router in the defaultConfiguration because
   * it reads app settings which might be set after that has run.
   */
  lazyrouter(): void;

  /**
   * Assign `setting` to `val`, or return `setting`'s value.
   *
   *    app.set('foo', 'bar');
   *    app.get('foo');
   *    // => "bar"
   *
   * Mounted servers inherit their parent server's settings.
   */
  set(setting: string, value?: any): this;
  get: ((setting: string) => any) & IRouterMatcher<this>;

  /**
   * Return the app's absolute pathname
   * based on the parent(s) that have
   * mounted it.
   *
   * For example if the application was
   * mounted as "/admin", which itself
   * was mounted as "/blog" then the
   * return value would be "/blog/admin".
   */
  path(): string;

  /**
   * Check if `setting` is enabled (truthy).
   *
   *    app.enabled('foo')
   *    // => false
   *
   *    app.enable('foo')
   *    app.enabled('foo')
   *    // => true
   */
  enabled(setting: string): boolean;

  /**
   * Check if `setting` is disabled.
   *
   *    app.disabled('foo')
   *    // => true
   *
   *    app.enable('foo')
   *    app.disabled('foo')
   *    // => false
   */
  disabled(setting: string): boolean;

  /** Enable `setting`. */
  enable(setting: string): this;

  /** Disable `setting`. */
  disable(setting: string): this;

  /**
   * Listen for connections.
   *
   * A Deno `Server` is returned.
   */
  listen(port: number): Server;
  listen(addr: string): Server;
  listen(options: HTTPOptions): Server;
  listen(options: HTTPSOptions): Server;

  router: string;

  settings: any;

  locals: any;

  /**
   * The app.routes object houses all of the routes defined mapped by the
   * associated HTTP verb. This object may be used for introspection
   * capabilities, for example Opine uses this internally not only for
   * routing but to provide default OPTIONS behaviour unless app.options()
   * is used. Your application or framework may also remove routes by
   * simply by removing them from this object.
   */
  routes: any;

  /**
   * Used to get all registered routes in Opine Application
   */
  _router: Router;

  use: ApplicationRequestHandler<this>;

  /**
   * The mount event is fired on a sub-app, when it is mounted on a parent app.
   * The parent app is passed to the callback function.
   *
   * NOTE:
   * Sub-apps will:
   *  - Not inherit the value of settings that have a default value. You must set the value in the sub-app.
   *  - Inherit the value of settings with no default value.
   */
  on(event: string, callback: (args: any) => any): any;

  /**
   * Emit an event using the applications event emitter.
   * 
   * Events will be raised based on the passed event string
   * and any listening _on()_ methods will receive the passed
   * _arg_ as an argument.
   */
  emit(event: string, arg: any): any;

  /**
   * The app.mountpath property contains one or more path patterns on which a sub-app was mounted.
   */
  mountpath: string | string[];

  cache: any;

  parent: any;
}

export interface Opine extends Application {
  request: Request;
  response: Response;
}
