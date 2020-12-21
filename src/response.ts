import { contentDisposition } from "./utils/contentDisposition.ts";
import { stringify } from "./utils/stringify.ts";
import { normalizeType, normalizeTypes } from "./utils/normalizeType.ts";
import {
  hasCookieNameProperty,
  hasCookieRequiredProperties,
} from "./utils/cookies.ts";
import { send, sendError } from "./utils/send.ts";
import {
  contentType,
  Cookie,
  encodeUrl,
  escapeHtml,
  extname,
  fromFileUrl,
  isAbsolute,
  resolve,
  setCookie,
  Status,
  STATUS_TEXT,
  vary,
} from "../deps.ts";
import type {
  Application,
  CookieOptions,
  CookieWithOptionalValue,
  DenoResponseBody,
  NextFunction,
  Request,
  Response as DenoResponse,
  ResponseBody,
} from "../src/types.ts";

/**
 * Response class.
 * 
 * @public
 */
export class Response implements DenoResponse {
  status: Status = 200;
  headers: Headers = new Headers();
  written: Boolean = false;
  body!: DenoResponseBody;
  app!: Application;
  req!: Request;
  locals!: any;

  #resources: number[] = [];

  /**
   * Add a resource ID to the list of resources to be
   * closed after the .end() method has been called.
   * 
   * @param {number} rid Resource ID
   * @public
   */
  addResource(rid: number): void {
    this.#resources.push(rid);
  }

  /**
   * Append additional header `field` with value `val`.
   * Value can be either a `string` or an array of `string`.
   * 
   * Example:
   *
   *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   *    res.append('Warning', '199 Miscellaneous warning');
   *    res.append("cache-control", ["public", "max-age=604800", "immutable"]);
   * 
   * @param {string} field
   * @param {string|string[]} value
   * @return {Response} for chaining
   * @public
   */
  append(field: string, value: string | string[]): this {
    if (Array.isArray(value)) {
      for (let i = 0, len = value.length; i < len; i++) {
        this.headers.append(field, value[i]);
      }
    } else {
      this.headers.append(field, value);
    }

    return this;
  }

  /**
   * Set _Content-Disposition_ header to _attachment_ with optional `filename`.
   *
   * @param {string} filename
   * @return {Response} for chaining
   * @public
   */
  attachment(filename: string): this {
    if (filename) {
      this.type(extname(filename));
    }

    this.set("Content-Disposition", contentDisposition("attachment", filename));

    return this;
  }

  /**
   * Set a cookie. Sets the cookie path to "/" if not defined.
   *
   * Examples:
   *
   *    // "Remember Me" for 15 minutes
   *    res.cookie({ name: "rememberme", value: "1", expires: new Date(Date.now() + 900000), httpOnly: true });
   *
   * @param {Cookie} cookie
   * @return {Response} for chaining
   * @public
   */
  cookie(name: string, value: string, options: CookieOptions): this;
  cookie(cookie: Cookie): this;
  cookie(nameOrCookie: unknown): this {
    let cookie: Cookie;

    if (typeof nameOrCookie === "string") {
      cookie = {
        ...arguments[2],
        name: nameOrCookie,
        value: arguments[1] ?? "",
      };
    } else if (hasCookieRequiredProperties(nameOrCookie)) {
      cookie = nameOrCookie;
    } else {
      throw new TypeError(
        "response.cookie, args provided do not match one of the supported signatures: " +
          Array.prototype.join.call(arguments, ", "),
      );
    }

    if (cookie.path == null) {
      cookie.path = "/";
    }

    setCookie(this, cookie);

    return this;
  }

  /**
   * Clear a cookie.
   *
   * @param {string|CookieWithOptionalValue} cookie
   * @return {Response} for chaining
   * @public
   */
  clearCookie(cookie: CookieWithOptionalValue): this;
  clearCookie(name: string, options?: CookieOptions): this;
  clearCookie(nameOrCookie: unknown): this {
    if (typeof nameOrCookie === "string") {
      setCookie(
        this,
        {
          path: "/",
          ...arguments[1],
          value: "",
          expires: new Date(0),
          name: nameOrCookie,
        },
      );
    } else if (hasCookieNameProperty(nameOrCookie)) {
      setCookie(this, {
        path: "/",
        ...nameOrCookie,
        value: "",
        expires: new Date(0),
      });
    } else {
      throw new TypeError(
        "res.clearCookie, args provided do not match one of the supported signatures: " +
          Array.prototype.join.call(arguments, ", "),
      );
    }

    return this;
  }

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
   *
   * @param {string} path
   * @param {string} [filename]
   * @param {object} [options]
   * @return {Promise<Response>}
   * @public
   */
  async download(
    path: string,
    filename?: string,
    options?: any,
  ): Promise<this | void> {
    const headers: { [key: string]: string } = {
      "Content-Disposition": contentDisposition("attachment", filename || path),
    };

    // Merge user-provided headers
    if (options?.headers) {
      const keys = Object.keys(options.headers);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (key.toLowerCase() !== "content-disposition") {
          headers[key] = options.headers[key];
        }
      }
    }

    // Merge user-provided options
    options = {
      ...options,
      headers,
    };

    const fullPath = resolve(
      path.startsWith("file:") ? fromFileUrl(path) : path,
    );

    // Send file
    return await this.sendFile(fullPath, options);
  }

  /**
   * Ends the response process.
   *
   * @param {DenoResponseBody} body
   * @return {Promise<void>}
   * @public
   */
  async end(
    body?: DenoResponseBody,
  ): Promise<void> {
    if (body) {
      this.body = body;
    }

    this.written = true;

    try {
      await this.req.respond(this);
    } catch (e) {
      // Connection might have been already closed
      if (!(e instanceof Deno.errors.BadResource)) {
        throw e;
      }
    }

    for (const rid of this.#resources) {
      try {
        Deno.close(rid);
      } catch (e) {
        // Resource might have been already closed
        if (!(e instanceof Deno.errors.BadResource)) {
          throw e;
        }
      }
    }

    this.#resources = [];
  }

  /**
   * Sets an ETag header.
   * 
   * @param {string|Uint8Array|Deno.FileInfo} chunk 
   * @returns {Response} for chaining
   * @public
   */
  etag(chunk: string | Uint8Array | Deno.FileInfo): this {
    const etagFn = this.app.get("etag fn");

    if (typeof etagFn === "function" && typeof (chunk as any).length) {
      const etag = etagFn(chunk);

      if (etag) {
        this.set("ETag", etag);
      }
    }

    return this;
  }

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
   *
   * @param {Object} obj
   * @return {Response} for chaining
   * @public
   */
  format(obj: any): this {
    const req = this.req;
    const next = req.next as NextFunction;

    const { default: fn, ...rest } = obj;
    const keys = Object.keys(rest);
    const accepts = keys.length > 0 ? req.accepts(keys) : false;

    this.vary("Accept");

    if (accepts) {
      const key = Array.isArray(accepts) ? accepts[0] : accepts;
      this.set("Content-Type", normalizeType(key).value);
      obj[key](req, this, next);
    } else if (fn) {
      fn();
    } else {
      const err = new Error("Not Acceptable") as any;
      err.status = err.statusCode = 406;
      err.types = normalizeTypes(keys).map(function (o) {
        return o.value;
      });

      next(err);
    }

    return this;
  }

  /**
   * Get value for header `field`.
   *
   * @param {string} field
   * @return {string} the header
   * @public
   */
  get(field: string): string {
    return this.headers.get(field.toLowerCase()) || "";
  }

  /**
   * Send JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'deno' });
   *
   * @param {ResponseBody} body
   * @return {Response} for chaining
   * @public
   */
  json(body: ResponseBody): this {
    const app = this.app;
    const replacer = app.get("json replacer");
    const spaces = app.get("json spaces");
    const escape = app.get("json escape");
    body = stringify(body, replacer, spaces, escape);

    if (!this.get("Content-Type")) {
      this.type("application/json");
    }

    return this.send(body);
  }

  /**
   * Send JSON response with JSONP callback support.
   *
   * Examples:
   *
   *     res.jsonp(null);
   *     res.jsonp({ user: 'deno' });
   *
   * @param {ResponseBody} body
   * @return {Response} for chaining
   * @public
   */
  jsonp(body: ResponseBody) {
    const app = this.app;
    const replacer = app.get("json replacer");
    const spaces = app.get("json spaces");
    const escape = app.get("json escape");
    body = stringify(body, replacer, spaces, escape);

    let callback = this.req.query[app.get("jsonp callback name")];

    if (Array.isArray(callback)) {
      callback = callback[0];
    }

    if (typeof callback === "string" && callback.length !== 0) {
      this.set("X-Content-Type-Options", "nosniff");
      this.type("text/javascript");

      // restrict callback charset
      callback = callback.replace(/[^\[\]\w$.]/g, "");

      // replace chars not allowed in JavaScript that are in JSON
      body = body
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");

      // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
      // the typeof check is just to reduce client error noise
      body = `/**/ typeof ${callback} === 'function' && ${callback}(${body});`;
    } else if (!this.get("Content-Type")) {
      this.set("X-Content-Type-Options", "nosniff");
      this.set("Content-Type", "application/json");
    }

    return this.send(body);
  }

  /**
   * Set Link header field with the given `links`.
   *
   * Examples:
   *
   *    res.links({
   *      next: 'http://api.example.com/users?page=2',
   *      last: 'http://api.example.com/users?page=5'
   *    });
   *
   * @param {any} links
   * @return {Response} for chaining
   * @public
   */
  links(links: any) {
    let currentLink = this.get("Link");

    if (currentLink) {
      currentLink += ", ";
    }

    const link = currentLink +
      Object.entries(links).map(([rel, field]) => `<${field}>; rel="${rel}"`)
        .join(", ");

    return this.set("Link", link);
  }

  /**
   * Set the location header to `url`.
   *
   * The given `url` can also be "back", which redirects
   * to the _Referrer_ or _Referer_ headers or "/".
   *
   * Examples:
   *
   *    res.location('/foo/bar').;
   *    res.location('http://example.com');
   *    res.location('../login');
   *
   * @param {string} url
   * @return {Response} for chaining
   * @public
   */
  location(url: string): this {
    const loc = url === "back" ? (this.req.get("Referrer") || "/") : url;

    // set location
    return this.set("Location", encodeUrl(loc));
  }

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
  redirect(statusCode: Status, url: string): void;
  redirect() {
    let address: string;
    let body: string = "";
    let status: Status;

    if (arguments.length === 0) {
      throw new TypeError("res.redirect: requires a location url");
    } else if (arguments.length === 1) {
      address = arguments[0] + "";
      status = 302;
    } else {
      if (typeof arguments[0] !== "number" || Number.isNaN(arguments[0])) {
        throw new TypeError(
          "res.redirect: expected status code to be a valid number",
        );
      }

      address = arguments[1] + "";
      status = arguments[0];
    }

    // Set location header
    address = this.location(address).get("Location");

    // Support text/{plain,html} by default
    this.format({
      text: function _renderRedirectBody() {
        body = `${STATUS_TEXT.get(status)}. Redirecting to ${address}`;
      },

      html: function _renderRedirectHtmlBoby() {
        const u = escapeHtml(address);
        body = `<p>${
          STATUS_TEXT.get(status)
        }. Redirecting to <a href="${u}">${u}</a></p>`;
      },

      default: function _renderDefaultRedirectBody() {
        body = "";
      },
    });

    // Respond
    this.status = status;

    if (this.req.method === "HEAD") {
      this.end();
    } else {
      this.end(body);
    }
  }

  /**
   * Render `view` with the given `options` and optional callback `fn`.
   * When a callback function is given a response will _not_ be made
   * automatically, otherwise a response of _200_ and _text/html_ is given.
   *
   * Options:
   *
   *  - `cache`     boolean hinting to the engine it should cache
   *  - `filename`  filename of the view being rendered
   *
   * @public
   */
  render(view: string, options: any = {}, callback?: any) {
    const app = this.req.app;
    const req = this.req;
    const self = this;
    let done = callback;

    // support callback function as second arg
    if (typeof options === "function") {
      done = options;
      options = {};
    }

    // merge res.locals
    options._locals = self.locals;

    // default callback to respond
    done = done || function (err: any, str: string) {
      if (err) {
        return (req as any).next(err);
      }

      self.send(str);
    };

    // render
    app.render(view, options, done);
  }

  /**
   * Send a response.
   *
   * Examples:
   *
   *     res.send({ some: 'json' });
   *     res.send('<p>some html</p>');
   *
   * @param {ResponseBody} body
   * @return {Response} for chaining
   * @public
   */
  send(body: ResponseBody): this {
    let chunk: DenoResponseBody;
    let isUndefined = body === undefined;

    if (isUndefined || body === null) {
      body = "";
    }

    switch (typeof body) {
      case "string":
        chunk = body;
        break;
      case "boolean":
      case "number":
        return this.json(body);
      case "object":
      default:
        if (
          body instanceof Uint8Array ||
          typeof (body as Deno.Reader).read === "function"
        ) {
          chunk = body as Uint8Array | Deno.Reader;

          if (!this.get("Content-Type")) {
            this.type("bin");
          }
        } else {
          return this.json(body);
        }
    }

    if (typeof chunk === "string" && !this.get("Content-Type")) {
      this.type("html");
    }

    if (
      !this.get("ETag") && (typeof chunk === "string" ||
        chunk instanceof Uint8Array) &&
      !isUndefined
    ) {
      this.etag(chunk);
    }

    if (this.req.fresh) {
      this.status = 304;
    }

    if (this.status === 204 || this.status === 304) {
      this.unset("Content-Type");
      this.unset("Content-Length");
      this.unset("Transfer-Encoding");

      chunk = "";
    }

    if (this.req.method === "HEAD") {
      this.end();
    } else {
      this.end(chunk);
    }

    return this;
  }

  /**
   * Transfer the file at the given `path`.
   *
   * Automatically sets the _Content-Type_ response header field.
   *
   * @param {string} path
   * @param {object} [options]
   * @return {Promise<Response>}
   * @public
   */
  async sendFile(path: string, options: any = {}): Promise<this | void> {
    if (!path) {
      throw new TypeError("path argument is required to res.sendFile");
    } else if (typeof path !== "string") {
      throw new TypeError("path must be a string to res.sendFile");
    }

    path = path.startsWith("file:") ? fromFileUrl(path) : path;

    if (!options.root && !isAbsolute(path)) {
      throw new TypeError(
        "path must be absolute or specify root to res.sendFile",
      );
    }

    const onDirectory = async () => {
      let stat: Deno.FileInfo;

      try {
        stat = await Deno.stat(path);
      } catch (err) {
        return sendError(this, err);
      }

      if (stat.isDirectory) {
        return sendError(this);
      }
    };

    options.onDirectory = onDirectory;

    if (options.headers) {
      const obj = options.headers;
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        this.set(k, obj[k]);
      }
    }

    return await send(this.req as Request, this, path, options);
  }

  /**
   * Send given HTTP status code.
   *
   * Sets the response status to `code` and the body of the
   * response to the standard description from deno's http_status.STATUS_TEXT
   * or the code number if no description.
   *
   * Examples:
   *
   *     res.sendStatus(200);
   *
   * @param {Status} code
   * @return {Response} for chaining
   * @public
   */
  sendStatus(code: Status): this {
    const body: string = STATUS_TEXT.get(code) || String(code);

    this.setStatus(code);
    this.type("txt");

    return this.send(body);
  }

  /**
   * Set header `field` to `value`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *     res.set('Accept', 'application/json');
   *     res.set({
   *       'Accept-Language': "en-US, en;q=0.5",
   *       'Accept': 'text/html',
   *     });
   * @param {string} field
   * @param {string} value
   * @return {Response} for chaining
   * @public
   */
  set(field: string, value: string): this;
  set(obj: Record<string, string>): this;
  set(field: unknown, value?: unknown): this {
    if (arguments.length === 2) {
      const lowerCaseField = (field + "").toLowerCase();
      const coercedVal = value + "";

      if (lowerCaseField === "content-type") {
        this.type(coercedVal);
      } else {
        this.headers.set(lowerCaseField, coercedVal);
      }
    } else if (typeof field === "object" && field) {
      const entries = Object.entries(field);

      for (const [key, val] of entries) {
        this.set(key, val);
      }
    }

    return this;
  }

  /**
   * Set status `code`.
   * 
   * This method deviates from Express due to the naming clash
   * with Deno.Response `status` property.
   *
   * @param {Status} code
   * @return {Response} for chaining
   * @public
   */
  setStatus(code: Status): this {
    this.status = code;

    return this;
  }

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
   * 
   * @param {string} type
   * @return {Response} for chaining
   * @public
   */
  type(type: string): this {
    const ct = contentType(type) || "application/octet-stream";
    this.headers.set("content-type", ct);

    return this;
  }

  /**
   * Deletes a header.
   * 
   * @param {string} field
   * @return {Response} for chaining
   * @public
   */
  unset(field: string): this {
    this.headers.delete(field);

    return this;
  }

  /**
   * Add `field` to Vary. If already present in the Vary set, then
   * this call is simply ignored.
   *
   * @param {Array|String} field
   * @return {Response} for chaining
   * @public
   */
  vary(field: string | string[]): this {
    vary(this.headers, field);

    return this;
  }
}
