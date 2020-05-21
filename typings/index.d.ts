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
  ResBody = any,
> {
  (
    req: Request<ResBody>,
    res: Response<ResBody>,
    next: NextFunction,
  ): any;
}

export type ErrorRequestHandler<
  ResBody = any,
> = (
  err: any,
  req: Request<ResBody>,
  res: Response<ResBody>,
  next: NextFunction,
) => any;

export type PathParams = string | RegExp | Array<string | RegExp>;

export type RequestHandlerParams<
  P extends Params = ParamsDictionary,
  ResBody = any,
> =
  | RequestHandler<ResBody>
  | ErrorRequestHandler<ResBody>
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
    ...handlers: Array<RequestHandler<ResBody>>
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

export interface IRouter extends RequestHandler {
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
}

export interface Router extends IRouter {}

export interface ByteRange {
  start: number;
  end: number;
}

export interface RequestRanges {}

export type Errback = (err: Error) => void;

export interface Request<ResBody = any>
  extends DenoServerRequest, Opine.Request {
  app?: Application;
  res?: Response<ResBody>;
  next?: NextFunction;
  params?: any;
  query?: any;
  baseUrl?: string;
  originalUrl?: string;
  route: any;
  _parsedUrl?: URL;
  _url?: string;
  _raw?: string;
}

export interface MediaType {
  value: string;
  quality: number;
  type: string;
  subtype: string;
}

export type Send<ResBody = any, T = Response<ResBody>> = (body?: ResBody) => T;

export interface DownloadOptions {
  headers?: { [field: string]: string };
  maxAge?: number;
}

export interface Response<ResBody = any>
  extends DenoServerResponse, Opine.Response {
  app?: Application;
  req?: Request;
  locals?: any;
  statusMessage?: any;

  append(field: string, value: string): this;

  attachment(filename?: string): this;

  cookie(cookie: Cookie): this;

  clearCookie(cookie: string): this;
  clearCookie(cookie: Cookie): this;

  download(path: string): Promise<void>;
  download(path: string, filename: string): Promise<void>;
  download(
    path: string,
    filename: string,
    options: DownloadOptions,
  ): Promise<void>;

  end(): Promise<void>;
  end(body: DenoResponseBody): Promise<void>;

  get(field: string): string;

  json: Send<ResBody, this>;

  send: Send<ResBody, this>;

  sendFile(path: string): Promise<void>;
  sendFile(path: string, options: any): Promise<void>;

  sendStatus(code: Status): this;

  set(field: string, value: string): this;

  setStatus(code: Status): this;

  type(type: string): this;

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
  (
    req: Request,
    res: Response,
  ): void;

  cache: any;
  settings: any;
  locals: any;
  mountpath: string | string[];
  _router: any;

  /**
   * Initialize the server.
   *
   *   - setup default configuration
   *   - setup default middleware
   *   - setup route reflection methods
   *
   * @private
   */
  init(): void;

  /**
   * Initialize application configuration.
   * 
   * @private
   */
  defaultConfiguration(): void;

  /**
   * Lazily adds the base router if it has not yet been added.
   *
   * We cannot add the base router in the defaultConfiguration because
   * it reads app settings which might be set after that has run.
   *
   * @private
   */
  lazyrouter(): void;

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
   * Proxy `Router#use()` to add middleware to the app router.
   * See Router#use() documentation for details.
   *
   * If the _fn_ parameter is an opine app, then it will be
   * mounted at the _route_ specified.
   *
   * @returns {Application} for chaining
   * @public
   */
  use: ApplicationRequestHandler<this>;

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
  set(setting: string): this;
  set(setting: string, val: any): this;

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
   * @public
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
   *
   * @param {string} setting
   * @return {boolean}
   * @public
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
   *
   * @param {string} setting
   * @return {boolean}
   * @public
   */
  disabled(setting: string): boolean;

  /**
   * Enable `setting`.
   *
   * @param {string} setting
   * @return {Application} for chaining
   * @public
   */
  enable(setting: string): this;

  /**
   * Disable `setting`.
   *
   * @param {string} setting
   * @return {Application} for chaining
   * @public
   */
  disable(setting: string): this;

  /**
   * Get `setting` if single string argument is passed.
   * Otherwise create a GET route handler.
   *
   * @return {Application} for chaining
   * @public
   */
  get: ((setting: string) => this) & IRouterMatcher<this>;

  /**
   * Listen for connections.
   *
   * @param {string|HTTPOptions|HTTPSOptions} options
   * @returns {Server} Configured Deno server
   * @public
   */
  listen(addr: string): Server;
  listen(options: HTTPOptions): Server;
  listen(options: HTTPSOptions): Server;
}
