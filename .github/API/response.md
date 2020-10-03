# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## Response

The `res` object represents the HTTP response that an Opine app sends when it gets an HTTP request.

In this documentation and by convention, the object is always referred to as `res` (and the HTTP request is `req`) but its actual name is determined by the parameters to the callback function in which you're working.

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

The `res` object is an enhanced version of Deno's own response object and supports all [built-in fields and methods](https://doc.deno.land/https/deno.land/std/http/mod.ts#Response).

### Properties

#### res.app

This property holds a reference to the instance of the Opine application that is using the middleware.

`res.app` is identical to the [req.app](./request.md#reqapp) property in the request object.

#### res.locals

An object that contains response local variables scoped to the request. Otherwise, this property is identical to [app.locals](./application.md#applocals).

This property is useful for exposing request-level information such as the request path name, authenticated user, user settings, and so on.

```ts
app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals.authenticated = !req.user.anonymous;
  next();
});
```

### Methods

#### res.append(field [, value])

Appends the specified `value` to the HTTP response header `field`. If the header is not already set, it creates the header with the specified string value.
The value parameter can be a string or an array.

Note: calling `res.set()` after `res.append()` will reset the previously-set header value.

```ts
res.append("Set-Cookie", "foo=bar; Path=/; HttpOnly");
res.append("Warning", "199 Miscellaneous warning");
res.append(
  "Link",
  [
    'https://www.google.com; rel="dns-prefetch"',
    'https://www.youtube.com; rel="preconnect"',
  ],
);
```

#### res.attachment([filename])

Sets the HTTP response `Content-Disposition` header field to "attachment". If a `filename` is given, then it sets the Content-Type based on the extension name via `res.type()`, and sets the `Content-Disposition` "filename=" parameter.

```ts
res.attachment();
// Content-Disposition: attachment

res.attachment("path/to/logo.png");
// Content-Disposition: attachment; filename="logo.png"
// Content-Type: image/png
```

#### res.cookie(cookie)

Sets a cookie using the passed cookie object.

The `cookie` parameter should meet the Deno [Cookie interface](https://doc.deno.land/https/deno.land/std/http/mod.ts#Cookie) which can have the following properties.

| Property   | Type          | Description                                                                                                                                                                                                                                 |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | String        | Name of the cookie.                                                                                                                                                                                                                         |
| `encode`   | String        | Value of the cookie.                                                                                                                                                                                                                        |
| `expires`  | Date          | Expiration date of the cookie.                                                                                                                                                                                                              |
| `httpOnly` | Boolean       | Indicates that cookie is not accessible via JavaScript.                                                                                                                                                                                     |
| `maxAge`   | Number        | Max-Age of the Cookie. Must be integer superior to 0.                                                                                                                                                                                       |
| `domain`   | String        | Specifies those hosts to which the cookie will be sent.                                                                                                                                                                                     |
| `path`     | String        | Path for the cookie. Defaults to "/".                                                                                                                                                                                                       |
| `secure`   | Boolean       | Indicates if the cookie is made using SSL & HTTPS.                                                                                                                                                                                          |
| `unparsed` | String[]      | Additional key value pairs with the form "key=value".                                                                                                                                                                                       |
| `sameSite` | http.SameSite | Value of the "SameSite" **Set-Cookie** attribute. More information at [https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1). |

> All `res.cookie()` does is call Deno's [http.setCookie](https://doc.deno.land/https/deno.land/std/http/mod.ts#setCookie) method to set the HTTP `Set-Cookie` header with the options provided.

For example:

```ts
res.cookie({
  name: "favourite",
  value: "white chocolate chip with raspberries",
  domain: ".example.com",
  path: "/admin",
  secure: true,
});
res.cookie({
  name: "rememberme",
  value: "1",
  expires: new Date(Date.now() + 900000),
  httpOnly: true,
});
```

You can set multiple cookies in a single response by calling `res.cookie` multiple times, for example:

```ts
res
  .setStatus(201)
  .cookie({
    name: "access_token",
    value: "Bearer " + token,
    expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
  })
  .cookie({ name: "test", value: "test" })
  .redirect(301, "/admin");
```

### res.cookie(name, value, options)

Sets a cookie using `name`, `value` and an optional configuration object whose 
type is [Cookie interface](https://doc.deno.land/https/deno.land/std/http/mod.ts#Cookie) without `name` and `value`.


```ts
res
  .setStatus(201)
  .cookie("tasty_cookie", "yummy", {
    secure: true,
    httpOnly: true,
    maxAge: 86400 // cookie will be removed after 24 hours
  })
  .cookie("burnt_cookie", "cookieValue")
  .redirect(301, "/admin");
```

#### res.clearCookie(name, options)

Clears the cookie specified by `name` and an optional configuration object whose 
type is [Cookie interface](https://doc.deno.land/https/deno.land/std/http/mod.ts#Cookie) without `name` and `value`.

```ts

const cookieOptions = { domain: "google.com", path: "/search" };

res.cookie("myCookie", "val", cookieOptions);
res.clearCookie("myCookie", cookieOptions);
```


#### res.clearCookie(cookie)

Clears the cookie specified by the provided cookie object.

```ts
res.cookie({ name: "myCookie" });
res.clearCookie({ name: "myCookie" });
```

#### async res.download(path [, filename])

Transfers the file at `path` as an "attachment". Typically, browsers will prompt the user for download. By default, the `Content-Disposition` header "filename=" parameter is `path` (this typically appears in the browser dialog). Override this default with the `filename` parameter.

This method uses [res.sendFile()](#async-ressendfilepath) to transfer the file.

```ts
await res.download("/report-12345.pdf");

await res.download("/report-12345.pdf", "report.pdf");

try {
  await res.download("/missing-report.pdf", "report.pdf");
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    res.status = 404;
    res.send("Cant find that report, sorry!");

    return;
  }

  next(err);
}
```

> **Note:** If providing a file URL to `res.download` as the `path` argument, path segments should first be URL encoded to ensure correct behaviour.

#### async res.end([data])

Ends the response process. This method actually just wraps the a method from the Deno standard http module, specifically the [respond() method of http.ServerRequest](https://doc.deno.land/https/deno.land/std/http/mod.ts#ServerRequest).

Use to quickly end the response without any data. If you need to respond with data, you should instead use methods such as [res.send()](#ressendbody) and [res.json()](#resjsonbody).

```ts
await res.end();
await res.setStatus(404).end();
```

#### res.etag(data)

Sets the response `ETag` HTTP header using the specified `data` parameter. The etag implementation used is determined by the [etag application setting](./application.md#application-settings).

```ts
res.etag(fileStat);
```

### res.format(object)

Performs content-negotiation on the `Accept` HTTP header on the request object, when present. It uses `req.accepts()` to select a handler for the request, based on the acceptable types ordered by their quality values. If the header is not specified, the first callback is invoked. When no match is found, the server responds with 406 "Not Acceptable", or invokes the `default` callback.

The `Content-Type` response header is set when a callback is selected. However, you may alter this within the callback using methods such as `res.set()` or `res.type()`.

The following example would respond with `{ "message": "hey" }` when the `Accept` header field is set to "application/json" or "\*/json" (however if it is "\*/\*", then the response will be "hey").

```ts
res.format({
  "text/plain": function () {
    res.send("hey");
  },

  "text/html": function () {
    res.send("<p>hey</p>");
  },

  "application/json": function () {
    res.send({ message: "hey" });
  },

  default: function () {
    // log the request and respond with 406
    res.status(406).send("Not Acceptable");
  },
});
```

In addition to canonicalized MIME types, you may also use extension names mapped to these types for a slightly less verbose implementation:

```ts
res.format({
  text: function () {
    res.send("hey");
  },

  html: function () {
    res.send("<p>hey</p>");
  },

  json: function () {
    res.send({ message: "hey" });
  },
});
```

#### res.get(field)

Returns the HTTP response header specified by `field`. The match is case-insensitive.

```ts
res.get("Content-Type");
// => "text/plain"
```

#### res.json([body])

Sends a JSON response. This method sends a response (with the correct content-type) that is the parameter converted to a JSON string using [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

The parameter can be any JSON type, including object, array, string, Boolean, number, or null, and you can also use it to convert other values to JSON.

```ts
res.json(null);
res.json({ user: "deno" });
res.setStatus(500).json({ error: "message" });
```

#### res.jsonp([body])

Sends a JSON response with JSONP support. This method is identical to `res.json()`, except that it opts-in to JSONP callback support.

```ts
res.jsonp(null);
// => callback(null)

res.jsonp({ user: "deno" });
// => callback({ "user": "deno" })

res.setStatus(500).jsonp({ error: "message" });
// => callback({ "error": "message" })
```

By default, the JSONP callback name is simply `callback`. Override this with the [jsonp callback name](./application.md#application-settings) setting.

The following are some examples of JSONP responses using the same code:

```ts
// ?callback=foo
res.jsonp({ user: "deno" });
// => foo({ "user": "deno" })

app.set("jsonp callback name", "cb");

// ?cb=foo
res.setStatus(500).jsonp({ error: "message" });
// => foo({ "error": "message" })
```

#### res.links(links)

Joins the `links` provided as properties of the parameter to populate the response's `Link` HTTP header field.

For example, the following call:

```ts
res.links({
  next: "http://api.example.com/users?page=2",
  last: "http://api.example.com/users?page=5",
});
```

Yields the following results:

```txt
Link: <http://api.example.com/users?page=2>; rel="next",
      <http://api.example.com/users?page=5>; rel="last"
```

#### res.location(path)

Sets the response `Location` HTTP header to the specified `path` parameter.

```ts
res.location("/foo/bar");
res.location("http://example.com");
res.location("back");
```

A `path` value of "back" has a special meaning, it refers to the URL specified in the `Referer` header of the request. If the `Referer` header was not specified, it refers to "/".

> After encoding the URL, if not encoded already, Opine passes the specified URL to the browser in the `Location` header, without any validation.
>
> Browsers take the responsibility of deriving the intended URL from the current URL or the referring URL, and the URL specified in the `Location` header; and redirect the user accordingly.

**Note:** If you wish to perform a redirect using `res.location()`, you will also need to manually send the request. This method only sets the `Location` header. To perform a redirect alongside this method use `res.sendStatus()`. For example:

```ts
app.get("/redirect", function (req, res, next) {
  res.location("/home").sendStatus(301);
});
```

#### res.redirect([status], url)

Redirects to the URL derived from the specified `path`, with specified `status`, a positive integer
that corresponds to an [HTTP status code](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) .
If not specified, `status` defaults to "302 "Found".

```typescript
res.redirect('/foo/bar')
res.redirect('http://example.com')
res.redirect(301, 'http://example.com')
```
Redirects can be a fully-qualified URL for redirecting to a different site:

```typescript
res.redirect('http://google.com')
```
Redirects can be relative to the root of the host name. For example, if the
application is on `http://example.com/admin/post/new`, the following
would redirect to the URL `http://example.com/admin`:

```typescript
res.redirect('/admin')
```

Redirects can be relative to the current URL. For example,
from `http://example.com/blog/admin/` (notice the trailing slash), the following
would redirect to the URL `http://example.com/blog/admin/post/new`.

```typescript
res.redirect('post/new')
```

Redirecting to `post/new` from `http://example.com/blog/admin` (no trailing slash),
will redirect to `http://example.com/blog/post/new`.

If you found the above behavior confusing, think of path segments as directories
(with trailing slashes) and files, it will start to make sense.

Path-relative redirects are also possible. If you were on
`http://example.com/admin/post/new`, the following would redirect to
`http://example.com/admin/post`:

```typescript
res.redirect('..')
```

A `back` redirection redirects the request back to the [referer](http://en.wikipedia.org/wiki/HTTP_referer),
defaulting to `/` when the referer is missing.

```typescript
res.redirect('back')
```

#### res.render(view [, locals][, callback])

Renders a `view` and sends the rendered HTML string to the client. Optional parameters:

- `locals`, an object whose properties define local variables for the view.
- `callback`, a callback function. If provided, the method returns both the possible error and rendered string, but does not perform an automated response. When an error occurs, the method invokes `next(err)` internally.

The `view` argument is a string that is the file path of the view file to render. This can be an absolute path, or a path relative to the `views` setting. If the path does not contain a file extension, then the `view engine` setting determines the file extension.

**NOTE:** The `view` argument is used in file system operations like reading a file from disk, and as so for security reasons should not contain input from the end-user.

> The local variable `cache` enables view caching. Set it to `true`, to cache the view during development; view caching is enabled by default.

```ts
// send the rendered view to the client
res.render("index");

// if a callback is specified, the rendered HTML string has to be sent explicitly
res.render("index", function (err, html) {
  res.send(html);
});

// pass a local variable to the view
res.render("user", { name: "Deno" }, function (err, html) {
  // ...
});
```

#### res.send([body])

Sends the HTTP response.

The `body` parameter can be a `Deno.Reader`, a `Uint8Array` object, a `String`, an `Object`, or an `Array`. For example:

```ts
res.send({ some: "json" });
res.send("<p>some html</p>");
res.setStatus(404).send("Sorry, we cannot find that!");
res.setStatus(500).send({ error: "something blew up" });
```

This method performs many useful tasks for simple non-streaming responses: For example, it automatically assigns the `Content-Type` HTTP response header field (unless previously defined) and provides automatic HEAD and HTTP cache freshness support.

When the parameter is a `Deno.Reader` or `Uint8Array` object, the method sets the `Content-Type` response header field to "application/octet-stream", unless previously defined.

When the parameter is a `String`, the method sets the `Content-Type` to "text/html":

```ts
res.send("<p>some html</p>");
```

When the parameter is an `Array` or `Object`, Opine responds with the JSON representation:

```ts
res.send({ user: "deno" });
res.send([1, 2, 3]);
```

#### async res.sendFile(path)

Transfers the file at the given `path`. Sets the `Content-Type` response HTTP header field based on the filename's extension.

> This API provides access to data on the running file system. Ensure that the way in which the `path` argument was constructed into an absolute path is secure if it contains user input.

Here is an example of using `res.sendFile`.

```ts
app.get("/file/:name", async function (req, res, next) {
  const fileName = req.params.name;

  try {
    await res.sendFile(fileName);
  } catch (err) {
    next(err);
  }
});
```

The following example illustrates using `res.sendFile` to provide fine-grained support for serving files:

```ts
app.get("/user/:uid/photos/:file", function (req, res) {
  const uid = req.params.uid;
  const file = req.params.file;

  req.user.mayViewFilesFrom(uid, async function (yes) {
    if (yes) {
      await res.sendFile("/uploads/" + uid + "/" + file);
    } else {
      res.setStatus(403).send("Sorry! You can't see that.");
    }
  });
});
```

> **Note:** If providing a file URL to `res.sendFile` as the `path` argument, path segments should first be URL encoded to ensure correct behaviour.

#### res.sendStatus(statusCode)

Sets the response HTTP status code to `statusCode` and send its string representation as the response body.

```ts
res.sendStatus(200); // equivalent to res.status(200).send('OK')
res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
```

If an unsupported status code is specified, the HTTP status is still set to `statusCode` and the string version of the code is sent as the response body.

> Some versions of Deno will throw a `new Deno.errors.InvalidData("Bad status code")` when `res.status` is set to an invalid HTTP status code (outside of the range `100` to `599`). Consult the HTTP server documentation for the Deno version being used.

```ts
res.sendStatus(9999); // equivalent to res.setStatus(9999).send('9999')
```

[More about HTTP Status Codes](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes)

#### res.set(field [, value])

Sets the response's HTTP header `field` to `value`, or pass an object to set multiple fields at once.

```ts
res.set("Content-Type", "text/plain");

res.set({
  "Content-Type", "text/plain; charset=utf-8",
  "Content-Length": "123",
  "Cache-control": "no-store",
});
```

#### res.setStatus(code)

Sets the HTTP status for the response. It is a chainable alias of Deno's [response.status](https://doc.deno.land/https/deno.land/std/http/mod.ts#Response).

```ts
res.setStatus(403).end();
res.setStatus(400).send("Bad Request");
res.setStatus(404).sendFile("/absolute/path/to/404.png");
```

#### res.type(type)

Sets the `Content-Type` HTTP header to the MIME type as determined by [media_types.contentType()](https://doc.deno.land/https/deno.land/x/media_types/mod.ts#contentType) for the specified `type`. If `type` contains the "/" character, then it sets the `Content-Type` to `type`.

```ts
res.type(".html");
// => 'text/html'
res.type("html");
// => 'text/html'
res.type("json");
// => 'application/json'
res.type("application/json");
// => 'application/json'
res.type("png");
// => 'image/png'
```

#### res.unset(field)

Remove the response's HTTP header `field`.

```ts
res.set("Content-Type");
```

#### res.vary(field)

Adds the field to the `Vary` response header, if it is not there already.

```ts
res.vary("User-Agent");
```
