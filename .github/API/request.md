# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## Request

The `req` object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on. In this documentation and by convention, the object is always referred to as `req` (and the HTTP response is `res`) but its actual name is determined by the parameters to the callback function in which you're working.

For example:

```ts
app.get("/user/:id", function (req, res) {
  res.send("user " + req.params.id);
});
```

But you could just as well have:

```ts
app.get("/user/:id", function (request, response) {
  response.send("user " + request.params.id);
});
```

The `req` object is an enhanced version of Deno's own request object and supports all [built-in fields and methods](https://doc.deno.land/https/deno.land/std/http/mod.ts#ServerRequest).

### Properties

#### req.app

This property holds a reference to the instance of the Opine application that is using the middleware.

If you follow the pattern in which you create a module that just exports a middleware function and dynamic `import()` it in your main file, then the middleware can access the Opine instance via `req.app`

For example:

```ts
// index.ts
app.get("/xpoweredbyenabled", (await import("./myMiddleware.ts")).myMiddleware);
```

```ts
// myMiddleware.ts
export const myMiddleware = function (req: any, res: any) {
  res.send("'X-Powered-By' header enabled: " + req.app.get("x-powered-by"));
};
```

#### req.baseUrl

The URL path on which a router instance was mounted.

The `req.baseUrl` property is similar to the `mountpath` property of the `app` object, except `app.mountpath` returns the matched path pattern(s).

For example:

```ts
const greet = Router();

greet.get("/jp", function (req, res) {
  console.log(req.baseUrl); // /greet
  res.send("Konichiwa!");
});

app.use("/greet", greet); // load the router on '/greet'
```

Even if you use a path pattern or a set of path patterns to load the router, the `baseUrl` property returns the matched string, not the pattern(s). In the following example, the `greet` router is loaded on two path patterns.

```ts
app.use(["/gre+t", "/hel{2}o"], greet); // load the router on '/gre+t' and '/hel{2}o'
```

When a request is made to `/greet/jp`, `req.baseUrl` is "/greet". When a request is made to `/hello/jp`, `req.baseUrl` is "/hello".

#### req.body

Contains the data submitted in the request body. By default the `req.body` is a `Deno.Reader`, and needs to be read using a body-parsing middleware such as [`json()`](./bodyParser.md) or [`urlencoded()`](./bodyParser.md).

The following example shows how to use body-parsing middleware to populate `req.parsedBody`. _Note:_ this is one way Opine differs from Express due to `req.body` being a protected property in Deno.

```ts
import {
  opine,
  json,
  urlencoded,
} from "https://deno.land/x/opine@0.23.1/mod.ts";

const app = opine();

app.use(json()); // for parsing application/json
app.use(urlencoded(); // for parsing application/x-www-form-urlencoded

app.post("/profile", function (req, res, next) {
  console.log(req.parsedBody);
  res.json(req.parsedBody);
});
```

The following example shows how to implement your own simple body-parsing middleware to transform `req.parsedBody` into a raw string:

```ts
import opine from "https://deno.land/x/opine@0.23.1/mod.ts";

const app = opine();

const bodyParser = async function (req, res, next) {
  const rawBody = await Deno.readAll(req.body);
  const decodedBody = decoder.decode(rawBody);

  (req as any).parsedBody = decodedBody;
};

app.use(bodyParser);

app.post("/profile", function (req, res, next) {
  console.log(req.parsedBody);
  res.send(req.parsedBody);
});
```

#### req.fresh

When the response is still "fresh" in the client's cache `true` is returned, otherwise `false` is returned to indicate that the client cache is now stale and the full response should be sent.

When a client sends the `Cache-Control: no-cache` request header to indicate an end-to-end reload request, this module will return `false` to make handling these requests transparent.

Further details for how cache validation works can be found in the [HTTP/1.1 Caching Specification](https://tools.ietf.org/html/rfc7234).

```ts
console.dir(req.fresh);
// => true
```

#### req.hostname

Contains the hostname derived from the `Host` HTTP header.

```ts
// Host: "example.com:3000"
console.dir(req.hostname);
// => 'example.com'
```

#### req.method

Contains a string corresponding to the HTTP method of the request: `GET`, `POST`, `PUT`, and so on.

#### req.originalUrl

> `req.url` is not a native Opine property, it is inherited from Deno's [http module](https://doc.deno.land/https/deno.land/std/http/mod.ts#ServerRequest).

This property is much like `req.url`; however, it retains the original request URL, allowing you to rewrite `req.url` freely for internal routing purposes. For example, the "mounting" feature of `app.use()` will rewrite `req.url` to strip the mount point.

```ts
// GET /search?q=something
console.dir(req.originalUrl);
// => '/search?q=something'
```

In a middleware function, `req.originalUrl` is a combination of `req.baseUrl` and `req.path`, as shown in the following example.

```ts
app.use("/admin", function (req, res, next) {
  // GET 'http://www.example.com/admin/new'
  console.dir(req.originalUrl); // '/admin/new'
  console.dir(req.baseUrl); // '/admin'
  console.dir(req.path); // '/new'
  next();
});
```

#### req.params

This property is an object containing properties mapped to the named route "parameters". For example, if you have the route `/user/:name`, then the "name" property is available as `req.params.name`. This object defaults to `{}`.

```ts
// GET /user/tj
console.dir(req.params.name);
// => 'tj'
```

When you use a regular expression for the route definition, capture groups are provided in the array using `req.params[n]`, where `n` is the n<sup>th</sup> capture group. This rule is applied to unnamed wild card matches with string routes such as `/file/*`:

```ts
// GET /file/javascripts/jquery.js
console.dir(req.params[0]);
// => 'javascripts/jquery.js'
```

Any changes made to the `req.params` object in a middleware or route handler will be reset.

> NOTE: Opine automatically decodes the values in `req.params` (using `decodeURIComponent`).

#### req.path

Contains the path part of the request URL.

```ts
// example.com/users?sort=desc
console.dir(req.path);
// => '/users'
```

> When called from a middleware, the mount point is not included in `req.path`. See [app.use()](./application.md#appusepath-callback--callback) for more details.

#### req.protocol

Contains the request protocol string: either `http` or (for TLS requests) `https`.

```ts
console.dir(req.protocol);
// => 'http'
```

#### req.query

This property is an object containing a property for each query string parameter in the route.

> As `req.query`'s shape is based on user-controlled input, all properties and values in this object are untrusted and should be validated before trusting. For example, `req.query.foo.toString()` may fail in multiple ways, for example `foo` may not be there or may not be a string, and `toString` may not be a function and instead a string or other user-input.

```ts
// GET /search?q=deno+land
console.dir(req.query.q);
// => 'deno land'

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
console.dir(req.query.order);
// => 'desc'

console.dir(req.query.shoe.color);
// => 'blue'

console.dir(req.query.shoe.type);
// => 'converse'

// GET /shoes?color[]=blue&color[]=black&color[]=red
console.dir(req.query.color);
// => ['blue', 'black', 'red']
```

#### req.route

Contains the currently-matched route, a string. For example:

```ts
app.get("/user/:id?", function userIdHandler(req, res) {
  console.log(req.route);
  res.send("GET");
});
```

Example output from the previous snippet:

```console
{ path: '/user/:id?',
  stack:
   [ { handle: [Function: userIdHandler],
       name: 'userIdHandler',
       params: undefined,
       path: undefined,
       keys: [],
       regexp: /^\/?$/i,
       method: 'get' } ],
  methods: { get: true } }
```

#### req.secure

A Boolean property that is true if a TLS connection is established. Equivalent to:

```js
console.dir(req.protocol === "https");
// => true
```

#### req.stale

Indicates whether the request is "stale," and is the opposite of `req.fresh`. For more information, see [req.fresh](#req.fresh).

```ts
console.dir(req.stale);
// => true
```

#### req.subdomains

An array of subdomains in the domain name of the request.

```ts
// Host: "deno.dinosaurs.example.com"
console.dir(req.subdomains);
// => ['dinosaurs', 'deno']
```

The application property `subdomain offset`, which defaults to 2, is used for determining the
beginning of the subdomain segments. To change this behavior, change its value
using [app.set](/{{ page.lang }}/4x/api.html#app.set).

#### req.xhr

A Boolean property that is `true` if the request's `X-Requested-With` header field is "XMLHttpRequest", indicating that the request was issued by a client library such as jQuery.

```js
console.dir(req.xhr);
// => true
```

### Methods

#### req.accepts(types)

Checks if the specified content types are acceptable, based on the request's `Accept` HTTP header field. The method returns the best match, or if none of the specified content types is acceptable, returns empty (in which case, the application should respond with `406 "Not Acceptable"`).

The `type` value may be a single MIME type string (such as "application/json"), an extension name such as "json", a comma-delimited list, or an array. For a list or array, the method returns the _best_ match (if any).

```ts
// Accept: text/html
req.accepts("html");
// => "html"

// Accept: text/*, application/json
req.accepts("html");
// => "html"
req.accepts("text/html");
// => "text/html"
req.accepts(["json", "text"]);
// => "json"
req.accepts("application/json");
// => "application/json"

// Accept: text/*, application/json
req.accepts("image/png");
req.accepts("png");
// => false

// Accept: text/*;q=.5, application/json
req.accepts(["html", "json"]);
// => "json"
```

#### req.acceptsCharsets(charset [, ...])

Returns the first accepted charset of the specified character sets, based on the request's `Accept-Charset` HTTP header field. If none of the specified charsets is accepted, returns empty.

#### req.acceptsEncodings(encoding [, ...])

Returns the first accepted encoding of the specified encodings, based on the request's `Accept-Encoding` HTTP header field. If none of the specified encodings is accepted, returns empty.

#### req.acceptsLanguages(lang [, ...])

Returns the first accepted language of the specified languages, based on the request's `Accept-Language` HTTP header field. If none of the specified languages is accepted, returns empty.

#### req.get(field)

Returns the specified HTTP request header field (case-insensitive match). The `Referrer` and `Referer` fields are interchangeable.

```ts
req.get("Content-Type");
// => "text/plain"

req.get("content-type");
// => "text/plain"

req.get("Something");
// => undefined
```

#### req.is(type)

Returns the matching content type if the incoming request's "Content-Type" HTTP header field matches the MIME type specified by the `type` parameter. If the request has no body, returns `null`. Returns `false` otherwise.

```js
// With Content-Type: text/html; charset=utf-8
req.is("html");
// => 'html'
req.is("text/html");
// => 'text/html'
req.is("text/*");
// => 'text/*'

// When Content-Type is application/json
req.is("json");
// => 'json'
req.is("application/json");
// => 'application/json'
req.is("application/*");
// => 'application/*'

req.is("html");
// => false
```

For more information, or if you have issues or concerns, see [Node's type-is](https://github.com/expressjs/type-is) and/or [Deno's type_is](https://github.com/ako-deno/type_is).

#### req.range(size[, options])

`Range` header parser.

The `size` parameter is the maximum size of the resource.

The `options` parameter is an object that can have the following properties.

| Property  | Type    | Description                                                                                                                                                                           |
| --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `combine` | Boolean | Specify if overlapping & adjacent ranges should be combined, defaults to `false`. When `true`, ranges will be combined and returned as if they were specified that way in the header. |

An array of ranges will be returned or negative numbers indicating an error parsing.

- `-2` signals a malformed header string
- `-1` signals an unsatisfiable range

```ts
// parse header from request
const range = req.range(1000);

// the type of the range
if (range.type === "bytes") {
  // the ranges
  range.forEach(function (r) {
    // do something with r.start and r.end
  });
}
```
