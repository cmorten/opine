import { contentDisposition } from "./utils/contentDisposition.ts";
import { stringify } from "./utils/stringify.ts";
import { encodeUrl } from "./utils/encodeUrl.ts";
import {
  setCookie,
  Cookie,
  delCookie,
  Status,
  STATUS_TEXT,
  fromFileUrl,
  extname,
  basename,
  contentType,
} from "../deps.ts";
import {
  Response as DenoResponse,
  ResponseBody,
  Request,
  Application,
  DenoResponseBody,
} from "../src/types.ts";

/**
 * Response class.
 * 
 * @public
 */
export class Response implements DenoResponse {
  status: Status = 200;
  headers: Headers = new Headers();
  body!: DenoResponseBody;
  app!: Application;
  req!: Request;
  locals!: any;

  // TODO: Supporting arrays.
  /**
   * Append additional header `field` with value `val`.
   *
   * Example:
   *
   *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   *    res.append('Warning', '199 Miscellaneous warning');
   *
   * @param {string} field
   * @param {string} value
   * @return {Response} for chaining
   * @public
   */
  append(field: string, value: string): this {
    this.headers.append(field, value);

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

  // TODO: back-compat support for Express signature.
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
  cookie(cookie: Cookie): this {
    if (cookie.path == null) {
      cookie.path = "/";
    }

    setCookie(this, cookie);

    return this;
  }

  // TODO: back-compat support for Express signature.
  /**
   * Clear a cookie.
   *
   * @param {string|Cookie} cookie
   * @return {Response} for chaining
   * @public
   */
  clearCookie(cookie: string | Cookie): this {
    const cookieName = typeof cookie === "string" ? cookie : cookie.name;
    delCookie(this, cookieName);

    return this;
  }

  // TODO: back-compat support for Express signature. i.e. support options.
  /**
   * Transfer the file at the given `path` as an attachment.
   *
   * Optionally providing an alternate attachment `filename`.
   *
   * This function will set the `Content-Disposition` header, overriding
   * any existing `Content-Disposition` header in order to set the attachment
   * and filename.
   *
   * This method uses `res.sendFile()`.
   *
   * @param {string} path
   * @param {string} filename
   * @return {Promise<Response>}
   * @public
   */
  async download(
    path: string,
    filename?: string,
  ): Promise<this | void> {
    this.set(
      "Content-Disposition",
      contentDisposition("attachment", basename(filename || path)),
    );

    try {
      await this.sendFile(path);
    } catch (err) {
      this.unset("Content-Disposition");

      throw err;
    }
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

    await this.req.respond(this);
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

  // TODO: format() {}

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
   *     res.json({ user: 'tj' });
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
   *     res.jsonp({ user: 'tj' });
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
      Object.entries(links).map(([field, rel]) => `<${field}>; rel="${rel}"`)
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

  // TODO: redirect() {}

  // TODO: render() {}

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
  send(body: ResponseBody = ""): this {
    let chunk: DenoResponseBody;

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
        chunk instanceof Uint8Array)
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

  // TODO: back-compat support for Express signature. Specifically options
  // parameter, but likely not callback. Should support:
  //
  // - abort handling
  // - directory handling
  // - error handling - see https://github.com/pillarjs/send/blob/master/index.js#L267
  // - `options` - see https://github.com/pillarjs/send#sendreq-path-options
  // - other headers: 'Accept-Ranges', 'Cache-Control', 'Content-Range'

  /**
   * Transfer the file at the given `path`.
   *
   * Automatically sets the _Content-Type_ response header field.
   *
   * @param {string} path
   * @return {Promise<Response>}
   * @public
   */
  async sendFile(path: string): Promise<this> {
    const body = await Deno.readFile(path);

    const stats: Deno.FileInfo = await Deno.stat(path);
    if (stats.mtime) {
      this.set("Last-Modified", stats.mtime.toUTCString());
    }
    if (!this.get("ETag")) {
      this.etag(stats);
    }

    this.type(extname(path));

    return this.send(body);
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

  // TODO: back-compat support for Express signature.
  // Namely objects and arrays.
  /**
   * Set header `field` to `value`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    res.set('Accept', 'application/json');
   *
   * @param {string} field
   * @param {string} value
   * @return {Response} for chaining
   * @public
   */
  set(field: string, value: string): this {
    const lowerCaseField = field.toLowerCase();

    if (lowerCaseField === "content-type") {
      return this.type(value);
    }

    this.headers.set(lowerCaseField, value);

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
    this.headers.set("content-type", contentType(type) || "");

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

  // TODO: vary() {}
}
