// Type definitions for Opine.
// Definitions by: Craig Morten <https://github.com/asos-craigmorten>

import type {
  Cookie as DenoCookie,
  HTTPOptions,
  HTTPSOptions,
  Response as DenoServerResponse,
  Server,
  ServerRequest as DenoServerRequest,
  Status,
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
export type ResponseBody =
  | null
  | undefined
  | number
  | boolean
  | object
  | DenoResponseBody;

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
  | Array<RequestHandler<P> | ErrorRequestHandler<P>>;

export type CookieWithOptionalValue = Omit<Cookie, "value"> & {
  value?: Cookie["value"];
};

export type CookieOptions = Omit<Cookie, "name" | "value">;

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
  param(name: string, fn: RequestParamHandler): void;

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

export interface RangeParserRange {
  start: number;
  end: number;
}

export interface RangeParserRanges extends Array<RangeParserRange> {
  type: string;
}

export interface RangeParserOptions {
  /**
   * The "combine" option can be set to `true` and overlapping & adjacent ranges
   * will be combined into a single range.
   */
  combine?: boolean;
}

export type RangeParserResultUnsatisfiable = -1;
export type RangeParserResultInvalid = -2;
export type RangeParserResult =
  | RangeParserResultUnsatisfiable
  | RangeParserResultInvalid;

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
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json", a comma-delimited list such as "json, html, text/plain",
   * or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     req.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('html');
   *     // => "html"
   *     req.accepts('text/html');
   *     // => "text/html"
   *     req.accepts('json, text');
   *     // => "json"
   *     req.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('image/png');
   *     req.accepts('png');
   *     // => undefined
   *
   *     // Accept: text/*;q=.5, application/json
   *     req.accepts(['html', 'json']);
   *     req.accepts('html, json');
   *     // => "json"
   */
  accepts(): string | string[] | false;
  accepts(type: string): string | string[] | false;
  accepts(type: string[]): string | string[] | false;
  accepts(...type: string[]): string | string[] | false;

  /**
   * Returns the first accepted charset of the specified character sets,
   * based on the request's Accept-Charset HTTP header field.
   * If none of the specified charsets is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsCharsets(): string | string[] | false;
  acceptsCharsets(charset: string): string | string[] | false;
  acceptsCharsets(charset: string[]): string | string[] | false;
  acceptsCharsets(...charset: string[]): string | string[] | false;

  /**
   * Returns the first accepted encoding of the specified encodings,
   * based on the request's Accept-Encoding HTTP header field.
   * If none of the specified encodings is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsEncodings(): string | string[] | false;
  acceptsEncodings(encoding: string): string | string[] | false;
  acceptsEncodings(encoding: string[]): string | string[] | false;
  acceptsEncodings(...encoding: string[]): string | string[] | false;

  /**
   * Returns the first accepted language of the specified languages,
   * based on the request's Accept-Language HTTP header field.
   * If none of the specified languages is accepted, returns false.
   *
   * For more information, or if you have issues or concerns, see accepts.
   */
  acceptsLanguages(): string | string[] | false;
  acceptsLanguages(lang: string): string | string[] | false;
  acceptsLanguages(lang: string[]): string | string[] | false;
  acceptsLanguages(...lang: string[]): string | string[] | false;

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
  get: (name: string) => string | undefined;
  param: (name: string, defaultValue?: string) => string | undefined;

  /**
   * Parse Range header field, capping to the given `size`.
   *
   * Unspecified ranges such as "0-" require knowledge of your resource length. In
   * the case of a byte range this is of course the total number of bytes.
   * If the Range header field is not given `undefined` is returned.
   * If the Range header field is given, return value is a result of range-parser.
   * See more ./types/range-parser/index.d.ts
   *
   * NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
   * should respond with 4 users when available, not 3.
   *
   */
  range(
    size: number,
    options?: RangeParserOptions,
  ): RangeParserRanges | RangeParserResult | undefined;

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains the give mime `type`.
   *
   * Examples:
   *
   *      // With Content-Type: text/html; charset=utf-8
   *      req.is('html');
   *      req.is('text/html');
   *      req.is('text/*');
   *      // => true
   *
   *      // When Content-Type is application/json
   *      req.is('json');
   *      req.is('application/json');
   *      req.is('application/*');
   *      // => true
   *
   *      req.is('html');
   *      // => false
   */
  is(type: string | string[]): string | boolean | null;

  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the "trust proxy"
   * setting is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   */
  protocol: string;

  /**
   * Short-hand for:
   *
   *    req.protocol == 'https'
   */
  secure: boolean;

  /**
   * Return the remote address, or when
   * "trust proxy" is `true` return
   * the upstream addr.
   */
  ip: string;

  /**
   * When "trust proxy" is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   */
  ips: string[];

  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain of
   * the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting "subdomain offset".
   *
   * For example, if the domain is "deno.dinosaurs.example.com":
   * If "subdomain offset" is not set, req.subdomains is `["dinosaurs", "deno"]`.
   * If "subdomain offset" is 3, req.subdomains is `["deno"]`.
   */
  subdomains: string[];

  /**
   * Returns the pathname of the URL.
   */
  path: string;

  /**
   * Parse the "Host" header field hostname.
   */
  hostname: string;

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   */
  fresh: boolean;

  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   */
  stale: boolean;

  /**
   * Check if the request was an _XMLHttpRequest_.
   */
  xhr: boolean;

  /**
   * Body of request.
   * 
   * If the body has been passed such that a `parsedBody`
   * property is defined, this returns the `parsedBody`
   * value.
   * 
   * To always get the raw body value, use the `raw`
   * property.
   */
  body: any;

  /**
   * Raw body of request.
   */
  raw: Deno.Reader;

  method: string;

  params: P;

  query: ReqQuery;

  route: any;

  originalUrl: string;

  url: string;

  baseUrl: string;

  proto: string;
  protoMinor: number;
  protoMajor: number;
  headers: Headers;
  conn: Deno.Conn;

  app: Application;

  /**
   * After middleware.init executed, Request will contain res and next properties.
   * See: opine/src/middleware/init.ts
   */
  res?: Response<ResBody>;
  next?: NextFunction;

  /**
   * After body parsers, Request will contain `_parsedBody` boolean property
   * dictating that the body has been parsed.
   * See: opine/src/middleware/bodyParser/
   */
  _parsedBody?: boolean;

  /**
   * After body parsers, Request will contain parsedBody property
   * containing the parsed body.
   * See: opine/src/middleware/bodyParser/
   */
  parsedBody?: any;

  /**
   * After calling `parseUrl` on the request object, the parsed url
   * is memoization by storing onto the `_parsedUrl` property.
   */
  _parsedUrl?: ParsedURL;

  /**
   * After calling `originalUrl` on the request object, the original url
   * is memoization by storing onto the `_parsedOriginalUrl` property.
   */
  _parsedOriginalUrl?: ParsedURL;
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
   * Boolean signifying whether the request has already been responded to.
   */
  written: Boolean;

  /**
   * Add a resource ID to the list of resources to be
   * closed after the .end() method has been called.
   */
  addResource(rid: number): void;

  /**
   * Appends the specified value to the HTTP response header field.
   * If the header is not already set, it creates the header with the specified value.
   * The value parameter can be a string or an array.
   *
   * Example:
   *
   *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   *    res.append('Warning', '199 Miscellaneous warning');
   *    res.append("cache-control", ["public", "max-age=604800", "immutable"]);
   *
   * Note: calling res.set() after res.append() will reset the previously-set header value.
   */
  append(field: string, value: string | string[]): this;

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
  cookie(cookie: DenoCookie): this;
  cookie(name: string, value: string, options?: CookieOptions): this;

  /** Clear cookie by `name`. */
  clearCookie(
    name: string,
    options?: CookieOptions,
  ): this;
  /** Clear the provided cookie. */
  clearCookie(cookie: CookieWithOptionalValue): this;

  /**
   * Transfer the file at the given `path` as an attachment.
   *
   * Optionally providing an alternate attachment `filename`.
   * 
   * Optionally providing an `options` object to use with `res.sendFile()`.
   *
   * This function will set the `Content-Disposition` header, overriding
   * any existing `Content-Disposition` header in order to set the attachment
   * and filename.
   *
   * This method uses `res.sendFile()`.
   */
  download(path: string): Promise<this | void>;
  download(path: string, filename: string): Promise<this | void>;
  download(path: string, filename: string, options: any): Promise<this | void>;

  /**
   * Sets an ETag header.
   */
  etag(chunk: string | Uint8Array | Deno.FileInfo): this;

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

  /**
   * Respond to the Acceptable formats using an `obj`
   * of mime-type callbacks.
   *
   * This method uses `req.accepted`, an array of
   * acceptable types ordered by their quality values.
   * When "Accept" is not present the _first_ callback
   * is invoked, otherwise the first match is used. When
   * no match is performed the server responds with
   * 406 "Not Acceptable".
   *
   * Content-Type is set for you, however if you choose
   * you may alter this within the callback using `res.type()`
   * or `res.set('Content-Type', ...)`.
   *
   *    res.format({
   *      'text/plain': function(){
   *        res.send('hey');
   *      },
   *
   *      'text/html': function(){
   *        res.send('<p>hey</p>');
   *      },
   *
   *      'application/json': function(){
   *        res.send({ message: 'hey' });
   *      }
   *    });
   *
   * In addition to canonicalized MIME types you may
   * also use extnames mapped to these types:
   *
   *    res.format({
   *      text: function(){
   *        res.send('hey');
   *      },
   *
   *      html: function(){
   *        res.send('<p>hey</p>');
   *      },
   *
   *      json: function(){
   *        res.send({ message: 'hey' });
   *      }
   *    });
   *
   * By default Express passes an `Error`
   * with a `.status` of 406 to `next(err)`
   * if a match is not made. If you provide
   * a `.default` callback it will be invoked
   * instead.
   */
  format(obj: any): this;

  /** Get value for header `field`. */
  get(field: string): string;

  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'deno' });
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
   *     res.jsonp({ user: 'deno' });
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
  * Redirect to the given `url` with optional response `status`
  * defaulting to `302`.
  *
  * The resulting `url` is determined by `res.location()`.
  *
  * Examples:
  *
  *    res.redirect('/foo/bar');
  *    res.redirect('http://example.com');
  *    res.redirect(301, 'http://example.com');
  *    res.redirect('../login'); // /blog/post/1 -> /blog/login
  *
  * @param {Status} statusCode
  * @param {string} url
  * @public
  */
  redirect(url: string): void;
  redirect(code: Status, url: string): void;

  /**
   * Render `view` with the given `options` and optional callback `fn`.
   * When a callback function is given a response will _not_ be made
   * automatically, otherwise a response of _200_ and _text/html_ is given.
   *
   * Options:
   *
   *  - `cache`     boolean hinting to the engine it should cache
   *  - `filename`  filename of the view being rendered
   */
  render(
    view: string,
    options?: object,
    callback?: (err: Error, html: string) => void,
  ): void;
  render(view: string, callback?: (err: Error, html: string) => void): void;

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
  sendFile(path: string, options?: any): Promise<this | void>;

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
   *     res.set('Accept', 'application/json');
   *     res.set({
   *       'Accept-Language': en-US, en;q=0.5,
   *       'Accept': 'text/html',
   *     });
   */
  set(field: string, value: string): this;
  set(obj: Record<string, string>): this;

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

  /**
   * Adds the field to the Vary response header, if it is not there already.
   * Examples:
   *
   *     res.vary('User-Agent').render('docs');
   *
   */
  vary(field: string): this;
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
    res?: Response,
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
  param(name: string | string[], fn: RequestParamHandler): this;

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
  listen(): Server;
  listen(port: number, callback?: Function): Server;
  listen(addr: string, callback?: Function): Server;
  listen(options: HTTPOptions, callback?: Function): Server;
  listen(options: HTTPSOptions, callback?: Function): Server;

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

  engines: any;

  /**
   * Register the given template engine callback `fn` for the
   * provided extension `ext`.
   */
  engine(
    ext: string,
    fn: (
      path: string,
      options: object,
      callback: (e: any, rendered: string) => void,
    ) => void,
  ): this;

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
   */
  render(
    name: string,
    options?: object,
    callback?: (err: Error, html: string) => void,
  ): void;
  render(name: string, callback: (err: Error, html: string) => void): void;
}

export interface Opine extends Application {
  request: Request;
  response: Response;
}
