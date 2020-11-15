# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## json([options])

This is a built-in middleware function in Opine. It parses incoming requests with JSON payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that only parses JSON and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body and supports automatic inflation of `gzip` and `deflate` encodings.

```ts
import { opine, json } from "https://deno.land/x/opine@0.25.0/mod.ts";

const app = opine();

app.use(json()); // for parsing application/json

app.post("/profile", function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```

The following table describes the properties of the optional `options` object.

| Property  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type     | Default              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- |
| `inflate` | Enables or disables handling deflated (compressed) bodies; when disabled, deflated bodies are rejected.                                                                                                                                                                                                                                                                                                                                                                                                                    | Boolean  | `true`               |
| `reviver` | The `reviver` option is passed directly to `JSON.parse` as the second argument. You can find more information on this argument [in the MDN documentation about JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter).                                                                                                                                                                                                            | Function | `null`               |
| `strict`  | Enables or disables only accepting arrays and objects; when disabled will accept anything `JSON.parse` accepts.                                                                                                                                                                                                                                                                                                                                                                                                            | Boolean  | `true`               |
| `type`    | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `json`), a mime type (like `application/json`), or a mime type with a wildcard (like `*/*` or `*/json`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/json"` |
| `verify`  | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                | Function | `undefined`          |

## raw([options])

This is a built-in middleware function in Opine. It parses incoming request payloads into a `Buffer` and is based on
[body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that parses all bodies as a `Buffer` and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body and supports automatic inflation of `gzip` and `deflate` encodings.

```ts
import { opine, raw } from "https://deno.land/x/opine@0.25.0/mod.ts";

const app = opine();

app.use(raw()); // for parsing application/octet-stream

app.post("/upload", function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```

The following table describes the properties of the optional `options` object.

| Property  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Type     | Default                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `inflate` | Enables or disables handling deflated (compressed) bodies; when disabled, deflated bodies are rejected.                                                                                                                                                                                                                                                                                                                                                                                                                                  | Boolean  | `true`                       |
| `type`    | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `bin`), a mime type (like `application/octet-stream`), or a mime type with a wildcard (like `*/*` or `application/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/octet-stream"` |
| `verify`  | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                              | Function | `undefined`                  |

## serveStatic(root, [options])

This is a built-in middleware function in Opine. It serves static files and is based on [serve-static](https://github.com/expressjs/serve-static/).

> NOTE: For best results, use a reverse proxy cache to improve performance of serving static assets.

The `root` argument specifies the root directory from which to serve static assets. The function determines the file to serve by combining `req.url` with the provided `root` directory. When a file is not found, instead of sending a 404 response, it instead calls `next()` to move on to the next middleware, allowing for stacking and fallbacks.

The following table describes the properties of the `options` object.

| Property      | Description                                                                                                                    | Type     | Default |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- |
| `fallthrough` | Let client errors fall-through as unhandled requests, otherwise forward a client error. See [fallthrough](#fallthrough) below. | Boolean  | `true`  |
| `redirect`    | Redirect to trailing "/" when the pathname is a directory.                                                                     | Boolean  | `true`  |
| `before`      | Function for setting HTTP headers to serve with the file. See [before](#before) below.                                         | Function |         |

### fallthrough

When this option is `true`, client errors such as a bad request or a request to a non-existent file will cause this middleware to simply call `next()` to invoke the next middleware in the stack. When false, these errors (even 404s), will invoke `next(err)`.

Set this option to `true` so you can map multiple physical directories to the same web address or for routes to fill in non-existent files.

Use `false` if you have mounted this middleware at a path designed to be strictly a single file system directory, which allows for short-circuiting 404s for less overhead. This middleware will also reply to all methods.

### before

For this option, specify a function (async is supported) to make modifications to the response prior to the file being served via a `res.sendFile()`. The general use-case for this function hook is to set custom response headers. The signature of the function is:

```ts
fn(res, path, stat);
```

Arguments:

- `res`, the [response object](./response.md#response).
- `path`, the file path that is being sent.
- `stat`, the `stat` object of the file that is being sent.

For example:

```ts
const before = (res: Response, path: string, stat: Deno.FileInfo) => {
  res.set("X-Timestamp", Date.now());
  res.set("X-Resource-Path", path);
  res.set("X-Resource-Size", stat.size);
};
```

### Example of serveStatic

Here is an example of using the `serveStatic` middleware function with an elaborate options object:

```ts
const options = {
  fallthrough: false
  redirect: false,
  before(res: Response, path: string, stat: Deno.FileInfo) {
    res.set("X-Timestamp", Date.now());
    res.set("X-Resource-Path", path);
    res.set("X-Resource-Size", stat.size);
  },
};

app.use(serveStatic("public", options));
```

## text([options])

This is a built-in middleware function in Opine. It parses incoming request payloads into a string and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that parses all bodies as a string and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body and supports automatic inflation of `gzip` and `deflate` encodings.

```ts
import { opine, text } from "https://deno.land/x/opine@0.25.0/mod.ts";

const app = opine();

app.use(text()); // for parsing text/plain

app.post("/logs", function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```

The following table describes the properties of the optional `options` object.

| Property         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Type     | Default        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| `defaultCharset` | Specify the default character set for the text content if the charset is not specified in the `Content-Type` header of the request.                                                                                                                                                                                                                                                                                                                                                                                 | String   | `"utf-8"`      |
| `inflate`        | Enables or disables handling deflated (compressed) bodies; when disabled, deflated bodies are rejected.                                                                                                                                                                                                                                                                                                                                                                                                             | Boolean  | `true`         |
| `type`           | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `txt`), a mime type (like `text/plain`), or a mime type with a wildcard (like `*/*` or `text/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"text/plain"` |
| `verify`         | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                         | Function | `undefined`    |

## urlencoded([options])

This is a built-in middleware function in Opine. It parses incoming requests with urlencoded payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that only parses urlencoded bodies and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts only UTF-8 encoding of the body and supports automatic inflation of `gzip` and `deflate` encodings.

```ts
import { opine, urlencoded } from "https://deno.land/x/opine@0.25.0/mod.ts";

const app = opine();

app.use(urlencoded()); // for parsing application/x-www-form-urlencoded

app.post("/submit", function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```

The following table describes the properties of the optional `options` object.

| Property         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type     | Default                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| `extended`       | This option allows to choose between parsing the URL-encoded data with the querystring library (when false) or the qs library (when true). The “extended” syntax allows for rich objects and arrays to be encoded into the URL-encoded format, allowing for a JSON-like experience with URL-encoded. For more information, please [see the NPM qs library](https://www.npmjs.com/package/qs).                                                                                                                                                             | Boolean  | `true`                                |
| `inflate`        | Enables or disables handling deflated (compressed) bodies; when disabled, deflated bodies are rejected.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Boolean  | `true`                                |
| `parameterLimit` | This option controls the maximum number of parameters that are allowed in the URL-encoded data. If a request contains more parameters than this value, an error will be raised.                                                                                                                                                                                                                                                                                                                                                                           | Number   | `1000`                                |
| `type`           | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `urlencoded`), a mime type (like `application/x-www-form-urlencoded`), or a mime type with a wildcard (like `*/x-www-form-urlencoded`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/x-www-form-urlencoded"` |
| `verify`         | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                                               | Function | `undefined`                           |
