# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## json([options])

This is a built-in middleware function in Opine. It parses incoming requests with JSON payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that only parses JSON and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `body` object containing the parsed data is populated on the `request` object after the middleware (i.e. `req.body`), or an empty object (`{}`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred.

> As `req.body`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.body.foo.toString()` may fail in multiple ways, for example `foo` may not be there or may not be a string, and `toString` may not be a function and instead a string or other user-input.

```ts
import { opine, json } from "https://deno.land/x/opine@master/mod.ts";

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
| `reviver` | The `reviver` option is passed directly to `JSON.parse` as the second argument. You can find more information on this argument [in the MDN documentation about JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter).                                                                                                                                                                                                            | Function | `null`               |
| `strict`  | Enables or disables only accepting arrays and objects; when disabled will accept anything `JSON.parse` accepts.                                                                                                                                                                                                                                                                                                                                                                                                            | Boolean  | `true`               |
| `type`    | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `json`), a mime type (like `application/json`), or a mime type with a wildcard (like `*/*` or `*/json`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/json"` |
| `verify`  | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                | Function | `undefined`          |

## text([options])

This is a built-in middleware function in Opine. It parses incoming request payloads into a string and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that parses all bodies as a string and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `body` string containing the parsed data is populated on the `request` object after the middleware (i.e. `req.body`), or an empty string (`""`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred.

> As `req.body`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.body.trim()` may fail in multiple ways, for example stacking multiple parsers `req.body` may be from a different parser. Testing that `req.body` is a string before calling string methods is recommended.

```ts
import { opine, text } from "https://deno.land/x/opine@master/mod.ts";

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
| `type`           | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `txt`), a mime type (like `text/plain`), or a mime type with a wildcard (like `*/*` or `text/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"text/plain"` |
| `verify`         | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                         | Function | `undefined`    |

## urlencoded([options])

This is a built-in middleware function in Opine. It parses incoming requests with urlencoded payloads and is based on [body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that only parses urlencoded bodies and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts only UTF-8 encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `body` object containing the parsed data is populated on the `request` object after the middleware (i.e. `req.body`), or an empty object (`{}`) if there was no body to parse, the `Content-Type` was not matched, or an error occurred. This object will contain key-value pairs, where the value can be any type supported by the URLSearchParams API.

> As `req.body`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.body.foo.toString()` may fail in multiple ways, for example `foo` may not be there or may not be a string, and `toString` may not be a function and instead a string or other user-input.

```ts
import { opine, urlencoded } from "https://deno.land/x/opine@master/mod.ts";

const app = opine();

app.use(urlencoded()); // for parsing application/x-www-form-urlencoded

app.post("/submit", function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```

The following table describes the properties of the optional `options` object.

| Property | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type     | Default                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------- |
| `type`   | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `urlencoded`), a mime type (like `application/x-www-form-urlencoded`), or a mime type with a wildcard (like `*/x-www-form-urlencoded`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/x-www-form-urlencoded"` |
| `verify` | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                                               | Function | `undefined`                           |

## raw([options])

This is a built-in middleware function in Opine. It parses incoming request payloads into a `Buffer` and is based on
[body-parser](http://expressjs.com/en/resources/middleware/body-parser.html).

Returns middleware that parses all bodies as a `Buffer` and only looks at requests where the `Content-Type` header matches the `type` option. This parser accepts any Unicode encoding of the body. It does not yet support automatic inflation of `gzip` nor `deflate` encodings.

A new `body` `Buffer` containing the parsed data is populated on the `request` object after the middleware (i.e. `req.body`), or an empty string (`""`) if there was no body to parse, the `Content-Type` was not matched, or an error
occurred.

> As `req.body`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.body.toString()` may fail in multiple ways, for example stacking multiple parsers `req.body` may be from a different parser. Testing that `req.body` is a `Buffer` before calling buffer methods is recommended.

```ts
import { opine, raw } from "https://deno.land/x/opine@master/mod.ts";

const app = opine();

app.use(raw()); // for parsing application/octet-stream

app.post("/upload", function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```

The following table describes the properties of the optional `options` object.

| Property | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Type     | Default                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `type`   | This is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the Deno [media_types](https://deno.land/x/media_types) library and this can be an extension name (like `bin`), a mime type (like `application/octet-stream`), or a mime type with a wildcard (like `*/*` or `application/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. | Mixed    | `"application/octet-stream"` |
| `verify` | This option, if supplied, is called as `verify(req, res, buf, encoding)`, where `buf` is a `Buffer` of the raw request body and `encoding` is the encoding of the request. The parsing can be aborted by throwing an error.                                                                                                                                                                                                                                                                                                              | Function | `undefined`                  |
