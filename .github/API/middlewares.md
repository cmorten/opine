# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## json([options])

This is a built-in middleware function in Opine. It parses incoming requests with JSON payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that only parses JSON and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `parsedBody` object containing the parsed data is populated on the `request` object after the middleware (i.e. `req.parsedBody`), or an empty object (`{}`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. _Note:_ this is one way Opine differs from Express due to `req.body` being a protected property in Deno.

> As `req.parsedBody`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.parsedBody.foo.toString()` may fail in multiple ways, for example `foo` may not be there or may not be a string, and `toString` may not be a function and instead a string or other user-input.

```ts
import { opine, json } from "https://deno.land/x/opine@0.21.5/mod.ts";

const app = opine();

app.use(json()); // for parsing application/json

app.post("/profile", function (req, res, next) {
  console.log(req.parsedBody);
  res.json(req.parsedBody);
});
```

The following table describes the properties of the optional `options` object.

| Property  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type     | Default              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- |
| `reviver` | The `reviver` option is passed directly to `JSON.parse` as the second argument. You can find more information on this argument [in the MDN documentation about JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter).                                                                                                                                                                                                            | Function | `null`               |
| `strict`  | Enables or disables only accepting arrays and objects; when disabled will accept anything `JSON.parse` accepts.                                                                                                                                                                                                                                                                                                                                                                                                            | Boolean  | `true`               |
| `type`    | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `json`), a mime type (like `application/json`), or a mime type with a wildcard (like `*/*` or `*/json`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/json"` |
| `verify`  | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                | Function | `undefined`          |

## raw([options])

This is a built-in middleware function in Opine. It parses incoming request payloads into a `Buffer` and is based on
[body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that parses all bodies as a `Buffer` and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `parsedBody` `Buffer` containing the parsed data is populated on the `request` object after the middleware (i.e. `req.parsedBody`), or an empty string (`""`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. _Note:_ this is one way Opine differs from Express due to `req.body` being a protected property in Deno.

> As `req.parsedBody`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.parsedBody.toString()` may fail in multiple ways, for example stacking multiple parsers `req.parsedBody` may be from a different parser. Testing that `req.parsedBody` is a `Buffer` before calling buffer methods is recommended.

```ts
import { opine, raw } from "https://deno.land/x/opine@0.21.5/mod.ts";

const app = opine();

app.use(raw()); // for parsing application/octet-stream

app.post("/upload", function (req, res, next) {
  console.log(req.parsedBody);
  res.json(req.parsedBody);
});
```

The following table describes the properties of the optional `options` object.

| Property | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Type     | Default                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `type`   | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `bin`), a mime type (like `application/octet-stream`), or a mime type with a wildcard (like `*/*` or `application/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/octet-stream"` |
| `verify` | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                              | Function | `undefined`                  |

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

Returns middleware that parses all bodies as a string and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `parsedBody` string containing the parsed data is populated on the `request` object after the middleware (i.e. `req.parsedBody`), or an empty string (`""`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. _Note:_ this is one way Opine differs from Express due to `req.body` being a protected property in Deno.

> As `req.parsedBody`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.parsedBody.trim()` may fail in multiple ways, for example stacking multiple parsers `req.parsedBody` may be from a different parser. Testing that `req.parsedBody` is a string before calling string methods is recommended.

```ts
import { opine, text } from "https://deno.land/x/opine@0.21.5/mod.ts";

const app = opine();

app.use(text()); // for parsing text/plain

app.post("/logs", function (req, res, next) {
  console.log(req.parsedBody);
  res.json(req.parsedBody);
});
```

The following table describes the properties of the optional `options` object.

| Property         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Type     | Default        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| `defaultCharset` | Specify the default character set for the text content if the charset is not specified in the `Content-Type` header of the request.                                                                                                                                                                                                                                                                                                                                                                                 | String   | `"utf-8"`      |
| `type`           | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `txt`), a mime type (like `text/plain`), or a mime type with a wildcard (like `*/*` or `text/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"text/plain"` |
| `verify`         | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                         | Function | `undefined`    |

## urlencoded([options])

This is a built-in middleware function in Opine. It parses incoming requests with urlencoded payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that only parses urlencoded bodies and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts only UTF-8 encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `parsedBody` object containing the parsed data is populated on the `request` object after the middleware (i.e. `req.parsedBody`), or an empty object (`{}`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. This object will contain key-value pairs, where the value can be any type supported by the URLSearchParams API. _Note:_ this is one way Opine differs from Express due to `req.body` being a protected property in Deno.

> As `req.parsedBody`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.parsedBody.foo.toString()` may fail in multiple ways, for example `foo` may not be there or may not be a string, and `toString` may not be a function and instead a string or other user-input.

```ts
import { opine, urlencoded } from "https://deno.land/x/opine@0.21.5/mod.ts";

const app = opine();

app.use(urlencoded()); // for parsing application/x-www-form-urlencoded

app.post("/submit", function (req, res, next) {
  console.log(req.parsedBody);
  res.json(req.parsedBody);
});
```

The following table describes the properties of the optional `options` object.

| Property | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type     | Default                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| `type`   | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `urlencoded`), a mime type (like `application/x-www-form-urlencoded`), or a mime type with a wildcard (like `*/x-www-form-urlencoded`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/x-www-form-urlencoded"` |
| `verify` | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                                               | Function | `undefined`                           |
