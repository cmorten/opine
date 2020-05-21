import {
  setCookie,
  Cookie,
  delCookie,
  Status,
  STATUS_TEXT,
  fromFileUrl,
  extname,
  contentType,
} from "../deps.ts";
import {
  Response as DenoResponse,
  DownloadOptions,
  ResponseBody,
  Request,
  Application,
  DenoResponseBody,
} from "../typings/index.d.ts";

const contentDisposition = (type: string, filename: string): string => {
  return `${type}${filename ? `; filename="${filename}"` : ""}`;
};

/**
 * Response.
 * @public
 */
class Response implements DenoResponse {
  status: Status = 200;
  headers: Headers = new Headers();
  body!: DenoResponseBody;
  app!: Application;
  req!: Request;
  locals!: any;

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

  /**
   * Set a cookie.
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
    setCookie(this, cookie);

    return this;
  }

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

  /**
   * Transfer the file at the given `path` as an attachment.
   *
   * Optionally providing an alternate attachment `filename`.
   *
   * Optionally providing an `options` object to use with `res.sendFile()`.
   * This function will set the `Content-Disposition` header, overriding
   * any `Content-Disposition` header passed as header options in order
   * to set the attachment and filename.
   *
   * This method uses `res.sendFile()`.
   *
   * @param {string} path
   * @param {string} filename
   * @param {DownloadOptions} options
   * @return {Promise<void>}
   * @public
   */
  async download(
    path: string,
    filename?: string,
    options: DownloadOptions = {},
  ): Promise<void> {
    options.headers = {
      ...options.headers,
      "Content-Disposition": contentDisposition("attachment", filename || path),
    };

    return await this.sendFile(path, options);
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

    await (this.req as any).respond(this);
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
    // TODO: app settings support for replacer, spaces, escape etc.
    const stringifiedBody = JSON.stringify(body);

    if (!this.get("Content-Type")) {
      this.type("application/json");
    }

    return this.send(stringifiedBody);
  }

  // TODO: jsonp() {}

  // TODO: links() {}

  // TODO: locations() {}

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
  send(body: ResponseBody): this {
    switch (typeof body) {
      case "string":
        if (!this.get("Content-Type")) {
          this.type("html");
        }

        break;
      case "boolean":
      case "number":
      case "object":
      default:
        if (body === null) {
          body = "";
        }

        return this.json(body);
    }

    const ct = contentType(this.get("Content-Type"));
    if (ct) {
      this.set("Content-Type", ct);
    }

    if (this.status === 204 || this.status === 304) {
      this.unset("Content-Type");
      this.unset("Content-Length");
      this.unset("Transfer-Encoding");

      body = "";
    }

    if ((this.req as any).method === "HEAD") {
      this.end();
    } else {
      this.end(body);
    }

    return this;
  }

  /**
   * Transfer the file at the given `path`.
   *
   * Automatically sets the _Content-Type_ response header field.
   *
   * Options:
   *
   *   - `maxAge`   defaulting to 0
   *
   * @param {string} path
   * @param {DownloadOptions} options
   * @return {Promise<void>}
   * @public
   */
  async sendFile(path: string, options: DownloadOptions = {}): Promise<void> {
    path = path.startsWith("file:") ? fromFileUrl(path) : path;
    const stats: Deno.FileInfo = await Deno.stat(path);

    if (stats.mtime) {
      this.set("Last-Modified", stats.mtime.toUTCString());
    }

    this.set("Content-Length", String(stats.size));
    this.set("Cache-Control", `max-age=${((options.maxAge || 0) / 1000) | 0}`);
    this.type(extname(path));

    const body = await Deno.readFile(path);

    return this.end(body);
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
    const body: string = STATUS_TEXT.get(code as Status) || String(code);

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
    this.headers.set("content-type", contentType(type) as string);

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

/**
 * Module exports.
 * @publics
 */
export default Response;
