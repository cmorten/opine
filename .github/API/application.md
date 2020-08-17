# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## Application

The `app` object conventionally denotes the Opine application. Create it by calling the top-level `opine()` function exported by the Opine module:

```ts
import opine from "https://deno.land/x/opine@0.21.0/mod.ts";

const app = opine();

app.get("/", function (req, res) {
  res.send("hello world");
});

app.listen({ port: 3000 });
```

The `app` object has methods for

- Routing HTTP requests; see for example, [app.METHOD](#appmethodpath-callback--callback-).
- Configuring middleware; see [app.route](#approutepath).
- Rendering HTML views; see [app.render](#apprenderview-locals-callback).
- Registering a template engine; see [app.engine](#appengineext-callback).

It also has settings (properties) that affect how the application behaves; for more information, see [Application settings](#application-settings).

> The Opine application object can be referred from the request object and the response object as `req.app`, and `res.app`, respectively.

### Properties

#### app.locals

The `app.locals` object has properties that are local variables within the application.

```ts
console.dir(app.locals.title);
// => 'My App'

console.dir(app.locals.email);
// => 'me@myapp.com'
```

Once set, the value of `app.locals` properties persist throughout the life of the application, in contrast with `res.locals` properties that are valid only for the lifetime of the request.

Local variables are available in middleware via `req.app.locals` (see `req.app`).

```ts
app.locals.title = "My App";
app.locals.email = "me@myapp.com";
```

#### app.mountpath

The `app.mountpath` property contains one or more path patterns on which a sub-app was mounted.

> A sub-app is an instance of `opine` that may be used for handling the request to a route.

```ts
import opine from "https://deno.land/x/opine@0.21.0/mod.ts";

const app = opine(); // the main app
const admin = opine(); // the sub app

admin.get("/", function (req, res) {
  console.log(admin.mountpath); // /admin
  res.send("Admin Homepage");
});

app.use("/admin", admin); // mount the sub app
```

It is similar to the `baseUrl` property of the `req` object, except `req.baseUrl` returns the matched URL path, instead of the matched patterns.

If a sub-app is mounted on multiple path patterns, `app.mountpath` returns the list of patterns it is mounted on, as shown in the following example.

```ts
const admin = opine();

admin.get("/", function (req, res) {
  console.dir(admin.mountpath); // [ '/adm*n', '/manager' ]
  res.send("Admin Homepage");
});

const secret = opine();
secret.get("/", function (req, res) {
  console.log(secret.mountpath); // /secr*t
  res.send("Admin Secret");
});

admin.use("/secr*t", secret); // load the 'secret' router on '/secr*t', on the 'admin' sub app
app.use(["/adm*n", "/manager"], admin); // load the 'admin' router on '/adm*n' and '/manager', on the parent app
```

### Events

#### app.on("mount", callback(parent))

The `mount` event is fired on a sub-app, when it is mounted on a parent app. The parent app is passed to the callback function.

> **NOTE**
>
> Sub-apps will:
>
> - Not inherit the value of settings that have a default value. You must set the value in the sub-app.
> - Inherit the value of settings with no default value.

```ts
const admin = opine();

admin.on("mount", function (parent) {
  console.log("Admin Mounted");
  console.log(parent); // refers to the parent app
});

admin.get("/", function (req, res) {
  res.send("Admin Homepage");
});

app.use("/admin", admin);
```

### Methods

#### app.all(path, callback [, callback ...])</h3>

This method is like the standard [app.METHOD()](#appmethodpath-callback--callback-) methods, except it matches all HTTP verbs.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Examples

The following callback is executed for requests to `/secret` whether using GET, POST, PUT, DELETE, or any other HTTP request method:

```ts
app.all("/secret", function (req, res, next) {
  console.log("Accessing the secret section ...");
  next(); // pass control to the next handler
});
```

The `app.all()` method is useful for mapping "global" logic for specific path prefixes or arbitrary matches. For example, if you put the following at the top of all other route definitions, it requires that all routes from that point on require authentication, and automatically load a user. Keep in mind that these callbacks do not have to act as end-points: `loadUser` can perform a task, then call `next()` to continue matching subsequent routes.

```ts
app.all("*", requireAuthentication, loadUser);
```

Or the equivalent:

```ts
app.all("*", requireAuthentication);
app.all("*", loadUser);
```

Another example is white-listed "global" functionality. The example is similar to the ones above, but it only restricts paths that start with "/api":

```ts
app.all("/api/*", requireAuthentication);
```

#### app.delete(path, callback [, callback ...])

Routes HTTP DELETE requests to the specified path with the specified callback functions.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Example

```ts
app.delete("/", function (req, res) {
  res.send("DELETE request to homepage");
});
```

#### app.disable(name)

Sets the Boolean setting `name` to `false`, where `name` is one of the properties from the [app settings table](#application-settings). Calling `app.set('foo', false)` for a Boolean property is the same as calling `app.disable('foo')`.

For example:

```ts
app.disable("x-powered-by");
app.get("x-powered-by");
// => false
```

#### app.disabled(name)

Returns `true` if the Boolean setting `name` is disabled (`false`), where `name` is one of the properties from the [app settings table](#application-settings).

```ts
app.disabled("x-powered-by");
// => true

app.enable("x-powered-by");
app.disabled("x-powered-by");
// => false
```

#### app.enable(name)

Sets the Boolean setting `name` to `true`, where `name` is one of the properties from the [app settings table](#application-settings). Calling `app.set('foo', true)` for a Boolean property is the same as calling `app.enable('foo')`.

```ts
app.enable("x-powered-by");
app.get("x-powered-by");
// => true
```

#### app.enabled(name)

Returns `true` if the setting `name` is enabled (`true`), where `name` is one of the properties from the [app settings table](#application-settings).

```ts
app.enabled("x-powered-by");
// => false

app.enable("x-powered-by");
app.enabled("x-powered-by");
// => true
```

#### app.engine(ext, callback)

Register the given template engine callback for the provided extension.

The template engine callback can be async, and should take a path and template options as arguments.

```ts
async function render(path: string, options: any) {
  const str = await Deno.readTextFile(path);

  return str.replace("{{user.name}}", options.user.name);
}

app.engine("tmpl", render);
```

#### app.get(name)

Returns the value of `name` app setting, where `name` is one of the strings in the [app settings table](#application-settings). For example:

```ts
app.get("title");
// => undefined

app.set("title", "My Site");
app.get("title");
// => "My Site"
```

#### app.get(path, callback [, callback ...])

Routes HTTP GET requests to the specified path with the specified callback functions.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Example

```ts
app.get("/", function (req, res) {
  res.send("GET request to homepage");
});
```

#### app.listen(addr, [callback])

Binds and listens for connections on the specified address. This method is nearly identical to Deno's [http.listenAndServe()](https://doc.deno.land/https/deno.land/std/http/server.ts#listenAndServe). An optional callback can be provided which will be executed after the server starts listening for requests - this is provided for legacy reasons to aid in transitions from Express on Node.

```ts
import opine from "https://deno.land/x/opine@0.21.0/mod.ts";

const app = opine();

app.listen("localhost:3000");
```

The `app.listen()` method returns a [http.Server](https://doc.deno.land/https/deno.land/std/http/server.ts#Server) object and (for HTTP) is a convenience method for the following:

```ts
app.listen = function (options) {
  const server = http.serve(options);

  (async () => {
    for await (const request of server) {
      app(request);
    }
  })();

  return server;
};
```

#### app.listen([port], [callback])

Binds and listens for connections on the specified numerical port. If no port is provided, an available port is assigned for you. This method is similar to Deno's [http.listenAndServe()](https://doc.deno.land/https/deno.land/std/http/server.ts#listenAndServe).

This method is supported for legacy reasons to aid in transitions from Express on Node.

```ts
import opine from "https://deno.land/x/opine@0.21.0/mod.ts";

const app = opine();
const PORT = 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
```

#### app.listen(httpOptions, [callback])

Binds and listens for connections using the specified [http.HTTPOptions](https://doc.deno.land/https/deno.land/std/http/server.ts#HTTPOptions). This method is nearly identical to Deno's [http.listenAndServe()](https://doc.deno.land/https/deno.land/std/http/server.ts#listenAndServe). An optional callback can be provided which will be executed after the server starts listening for requests - this is provided for legacy reasons to aid in transitions from Express on Node.

```ts
import opine from "https://deno.land/x/opine@0.21.0/mod.ts";

const app = opine();

app.listen({ port: 3000 });
```

#### app.listen(httpsOptions, [callback])

Binds and listens for connections using the specified [http.HTTPSOptions](https://doc.deno.land/https/deno.land/std/http/server.ts#HTTPSOptions). This method is nearly identical to Deno's [http.listenAndServeTLS()](https://doc.deno.land/https/deno.land/std/http/server.ts#listenAndServeTLS). An optional callback can be provided which will be executed after the server starts listening for requests - this is provided for legacy reasons to aid in transitions from Express on Node.

```ts
import opine from "https://deno.land/x/opine@0.21.0/mod.ts";

const app = opine();

app.listen({ port: 3000, certFile: "myCertFile", keyFile: "myKeyFile" });
```

#### app.METHOD(path, callback [, callback ...])

Routes an HTTP request, where METHOD is the HTTP method of the request, such as GET, PUT, POST, and so on, in lowercase. Thus, the actual methods are `app.get()`, `app.post()`, `app.put()`, and so on. See [Routing methods](#routing-methods) below for the complete list.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Routing methods

Opine supports the following routing methods corresponding to the HTTP methods of the same names:

- `checkout`
- `copy`
- `delete`
- `get`
- `head`
- `lock`
- `merge`
- `mkactivity`
- `mkcol`
- `move`
- `m-search`
- `notify`
- `options`
- `patch`
- `post`
- `purge`
- `put`
- `report`
- `search`
- `subscribe`
- `trace`
- `unlock`
- `unsubscribe`

The API documentation has explicit entries only for the most popular HTTP methods `app.get()`, `app.post()`, `app.put()`, and `app.delete()`. However, the other methods listed above work in exactly the same way.

To route methods that translate to invalid JavaScript variable names, use the bracket notation. For example, `app['m-search']('/', function ...`.

> The `app.get()` function is automatically called for the HTTP `HEAD` method in addition to the `GET` method if `app.head()` was not called for the path before `app.get()`.

The method, `app.all()`, is not derived from any HTTP method and loads middleware at the specified path for _all_ HTTP request methods. For more information, see [app.all](#appallpath-callback--callback-).

#### app.param([name], callback)

Add callback triggers to route parameters, where `name` is the name of the parameter or an array of them, and `callback` is the callback function. The parameters of the callback function are the request object, the response object, the next middleware, the value of the parameter and the name of the parameter, in that order.

If `name` is an array, the `callback` trigger is registered for each parameter declared in it, in the order in which they are declared. Furthermore, for each declared parameter except the last one, a call to `next` inside the callback will call the callback for the next declared parameter. For the last parameter, a call to `next` will call the next middleware in place for the route currently being processed, just like it would if `name` were just a string.

For example, when `:user` is present in a route path, you may map user loading logic to automatically provide `res.locals.user` to the route/middleware, or perform validations on the parameter input.

```ts
app.param('user', function (req, res, next, id) {
  // try to get the user details from the User model and attach it to the request object
  User.find(id, function (err, user) {
    if (err) {
      next(err)
    } else if (user) {
      res.locals.user = user
      next()
    } else {
      next(new Error('failed to load user'))
    }
  })
})
```

Param callback functions are local to the router on which they are defined. They are not inherited by mounted apps or routers. Hence, param callbacks defined on `app` will be triggered only by route parameters defined on `app` routes.

All param callbacks will be called before any handler of any route in which the param occurs, and they will each be called only once in a request-response cycle, even if the parameter is matched in multiple routes, as shown in the following examples.

```ts
app.param('id', function (req, res, next, id) {
  console.log('CALLED ONLY ONCE')
  next()
})

app.get('/user/:id', function (req, res, next) {
  console.log('although this matches')
  next()
})

app.get('/user/:id', function (req, res) {
  console.log('and this matches too')
  res.end()
})
```

On `GET /user/42`, the following is printed:

```sh
CALLED ONLY ONCE
although this matches
and this matches too
```

```ts
app.param(['id', 'page'], function (req, res, next, value) {
  console.log('CALLED ONLY ONCE with', value)
  next()
})

app.get('/user/:id/:page', function (req, res, next) {
  console.log('although this matches')
  next()
})

app.get('/user/:id/:page', function (req, res) {
  console.log('and this matches too')
  res.end()
})
```

On `GET /user/42/3`, the following is printed:

```sh
CALLED ONLY ONCE with 42
CALLED ONLY ONCE with 3
although this matches
and this matches too
```

#### app.path()

Returns the canonical path of the app, a string.

```ts
const app = opine();
const blog = opine();
const blogAdmin = opine();

app.use("/blog", blog);
blog.use("/admin", blogAdmin);

console.dir(app.path()); // ''
console.dir(blog.path()); // '/blog'
console.dir(blogAdmin.path()); // '/blog/admin'
```

The behavior of this method can become very complicated in complex cases of mounted apps: it is usually better to use `req.baseUrl` to get the canonical path of the app.

#### app.post(path, callback [, callback ...])

Routes HTTP POST requests to the specified path with the specified callback functions.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Example

```ts
app.post("/", function (req, res) {
  res.send("POST request to homepage");
});
```

#### app.put(path, callback [, callback ...])

Routes HTTP PUT requests to the specified path with the specified callback functions.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Example

```ts
app.put("/", function (req, res) {
  res.send("PUT request to homepage");
});
```

#### app.render(view, [locals], callback)

Returns the rendered HTML of a view via the `callback` function. It accepts an optional parameter that is an object containing local variables for the view. It is like [res.render()](#res.render), except it cannot send the rendered view to the client on its own.

> Think of `app.render()` as a utility function for generating rendered view strings. Internally `res.render()` uses `app.render()` to render views.
>
> The local variable `cache` is reserved for enabling view cache. Set it to `true`, if you want to cache view during development; view caching is enabled in production by default.

```ts
app.render("email", function (err, html) {
  // ...
});

app.render("email", { name: "Deno" }, function (err, html) {
  // ...
});
```

#### app.route(path)

Returns an instance of a single route, which you can then use to handle HTTP verbs with optional middleware. Use `app.route()` to avoid duplicate route names (and thus typo errors).

```ts
const app = opine();

app
  .route("/events")
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
  })
  .get(function (req, res, next) {
    res.json({});
  })
  .post(function (req, res, next) {
    // maybe add a new event...
  });
```

#### app.set(name, value)

Assigns setting `name` to `value`. You may store any value that you want, but certain names can be used to configure the behavior of the server. These special names are listed in the [app settings table](#application-settings).

Calling `app.set('foo', true)` for a Boolean property is the same as calling `app.enable('foo')`. Similarly, calling `app.set('foo', false)` for a Boolean property is the same as calling `app.disable('foo')`.

Retrieve the value of a setting with [`app.get()`](#appgetname).

```ts
app.set("title", "My Site");
app.get("title"); // "My Site"
```

##### Application Settings

The following table lists application settings.

Note that sub-apps will:

- Not inherit the value of settings that have a default value. You must set the value in the sub-app.
- Inherit the value of settings with no default value; these are explicitly noted in the table below.

<div class="table-scroller">
  <table class="doctable">
    <thead><tr><th id="app-settings-property">Property</th><th>Type</th><th>Description</th><th>Default</th></tr></thead>
    <tbody>
    <tr>
  <td markdown="1">
  `case sensitive routing`
  </td>
      <td>Boolean</td>
      <td><p>Enable case sensitivity.
      When enabled, "/Foo" and "/foo" are different routes.
      When disabled, "/Foo" and "/foo" are treated the same.</p>
        <p><b>NOTE</b>: Sub-apps will inherit the value of this setting.</p>
      </td>
      <td>N/A (undefined)
      </td>
    </tr>
    <tr>
  <td markdown="1">
  `etag`
  </td>
  <td>Varied</td>
  <td markdown="1">
    Set the ETag response header. For possible values, see the <a href="#options-for-etag-setting">`etag` options table</a>

<a href="http://en.wikipedia.org/wiki/HTTP_ETag">More about the HTTP ETag header</a>.

  </td>
  <td markdown="1">
  `weak`
  </td>
    </tr>
    <tr>
  <td markdown="1">
  `jsonp callback name`
  </td>
      <td>String</td>
      <td>Specifies the default JSONP callback name.</td>
  <td markdown="1">
  "callback"
  </td>
    </tr>
    <tr>
  <td markdown="1">
  `json escape`
  </td>
  <td>Boolean</td>
  <td markdown="1">
  Enable escaping JSON responses from the `res.json`, `res.jsonp`, and `res.send` APIs. This will escape the characters `<`, `>`, and `&` as Unicode escape sequences in JSON. The purpose of this it to assist with <a href="https://blog.mozilla.org/security/2017/07/18/web-service-audits-firefox-accounts/">mitigating certain types of persistent XSS attacks</a> when clients sniff responses for HTML.
  <p><b>NOTE</b>: Sub-apps will inherit the value of this setting.</p>
  </td>
  <td>N/A (undefined)</td>
    </tr>
    <tr>
  <td markdown="1">
  `json replacer`
  </td>
      <td>Varied</td>
      <td>The <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter">'replacer' argument used by `JSON.stringify`</a>.
        <p><b>NOTE</b>: Sub-apps will inherit the value of this setting.</p>
      </td>
  <td>N/A (undefined)
  </td>
    </tr>
    <tr>
  <td markdown="1">
  `json spaces`
  </td>
      <td>Varied</td>
      <td>The <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_space_argument">'space' argument used by `JSON.stringify`</a>.
This is typically set to the number of spaces to use to indent prettified JSON.
        <p><b>NOTE</b>: Sub-apps will inherit the value of this setting.</p>
      </td>
      <td>N/A (undefined)</td>
    </tr>
    <tr>
  <td markdown="1">
  `strict routing`
  </td>
      <td>Boolean</td>
      <td><p>Enable strict routing.
      When enabled, the router treats "/foo" and "/foo/" as different.
      Otherwise, the router treats "/foo" and "/foo/" as the same.</p>
        <p><b>NOTE</b>: Sub-apps will inherit the value of this setting.</p>
      </td>
      <td>N/A (undefined) </td>
    </tr>
    <tr>
  <td markdown="1">
  `x-powered-by`
  </td>
      <td>Boolean</td>
      <td>Enables the "X-Powered-By: Opine" HTTP header.</td>
  <td markdown="1">
  `true`
  </td>
    </tr>
    </tbody>
  </table>

###### Options for `etag` setting

  <table class="doctable">
    <thead><tr><th>Type</th><th>Value</th></tr></thead>
    <tbody>
      <tr>
        <td>Boolean</td>
  <td markdown="1">
  `true` enables weak ETag. This is the default setting.<br>
  `false` disables ETag altogether.
  </td>
      </tr>
      <tr>
        <td>String</td>
        <td>
            If "strong", enables strong ETag.<br>
            If "weak", enables weak ETag.
        </td>
      </tr>
      <tr>
        <td>Function</td>
  <td markdown="1">Custom ETag function implementation. Use this only if you know what you are doing.

```ts
app.set("etag", function (body, encoding) {
  return generateHash(body, encoding); // consider the function is defined
});
```

  </td>
      </tr>
    </tbody>
  </table>
</div>

#### app.use([path,] callback [, callback...])

Mounts the specified middleware function or functions at the specified path: the middleware function is executed when the base of the requested path matches `path`.

##### Arguments

<table class="doctable" style="padding-left: 20px;">
  <tr>
    <th>Argument</th>
    <th>Description</th>
    <th style="width: 100px;">Default</th>
  </tr>

  <tr>
    <td><code>path</code></td>
    <td>
      The path for which the middleware function is invoked; can be any of:
      <ul>
        <li>A string representing a path.</li>
        <li>A path pattern.</li>
        <li>A regular expression pattern to match paths.</li>
        <li>An array of combinations of any of the above.</li>
      </ul>

For examples, see <a href="#path-examples">Path examples</a>.

</td>
<td>'/' (root path)</td>

  </tr>

  <tr>
    <td><code>callback</code></td>
    <td>
      Callback functions; can be:
      <ul>
        <li>A middleware function.</li>
        <li>A series of middleware functions (separated by commas).</li>
        <li>An array of middleware functions.</li>
        <li>A combination of all of the above.</li>
      </ul>
      <p>
        You can provide multiple callback functions that behave just like
        middleware, except that these callbacks can invoke
        <code>next('route')</code> to bypass the remaining route callback(s).
        You can use this mechanism to impose pre-conditions on a route, then
        pass control to subsequent routes if there is no reason to proceed with
        the current route.
      </p>
      <p>
        Since <a href="#router">router</a> and
        <a href="#application">app</a> implement the middleware interface, you
        can use them as you would any other middleware function.
      </p>
      <p>
        For examples, see
        <a href="#middleware-callback-function-examples"
          >Middleware callback function examples</a
        >.
      </p>
    </td>
    <td>None</td>
  </tr>
</table>

##### Description

A route will match any path that follows its path immediately with a "`/`". For example: `app.use('/apple', ...)` will match "/apple", "/apple/images", "/apple/images/news", and so on.

Since `path` defaults to "/", middleware mounted without a path will be executed for every request to the app. For example, this middleware function will be executed for _every_ request to the app:

```ts
app.use(function (req, res, next) {
  console.log("Time: %d", Date.now());
  next();
});
```

> **NOTE**
>
> Sub-apps will:
>
> - Not inherit the value of settings that have a default value. You must set the value in the sub-app.
> - Inherit the value of settings with no default value.

</div>

Middleware functions are executed sequentially, therefore the order of middleware inclusion is important.

```ts
// this middleware will not allow the request to go beyond it
app.use(function (req, res, next) {
  res.send("Hello World");
});

// requests will never reach this route
app.get("/", function (req, res) {
  res.send("Welcome");
});
```

**Error-handling middleware**

Error-handling middleware always takes _four_ arguments. You must provide four arguments to identify it as an error-handling middleware function. Even if you don't need to use the `next` object, you must specify it to maintain the signature. Otherwise, the `next` object will be interpreted as regular middleware and will fail to handle errors. For details about error-handling middleware.

Define error-handling middleware functions in the same way as other middleware functions, except with four arguments instead of three, specifically with the signature `(err, req, res, next)`):

```ts
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
```

##### Path examples

The following table provides some simple examples of valid `path` values for mounting middleware.

<table class="doctable">
  <thead>
    <tr>
      <th> Type </th>
      <th> Example </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Path</td>
      <td>
      This will match paths starting with `/abcd`:

```ts
app.use("/abcd", function (req, res, next) {
  next();
});
```

  </td>
    </tr>
    <tr>
      <td>Path Pattern</td>
      <td>
      This will match paths starting with `/abcd` and `/abd`:

```ts
app.use("/abc?d", function (req, res, next) {
  next();
});
```

This will match paths starting with `/abcd`, `/abbcd`, `/abbbbbcd`, and so on:

```ts
app.use("/ab+cd", function (req, res, next) {
  next();
});
```

This will match paths starting with `/abcd`, `/abxcd`, `/abFOOcd`, `/abbArcd`, and so on:

```ts
app.use("/ab*cd", function (req, res, next) {
  next();
});
```

This will match paths starting with `/ad` and `/abcd`:

```ts
app.use("/a(bc)?d", function (req, res, next) {
  next();
});
```

  </td>
    </tr>
    <tr>
      <td>Regular Expression</td>
      <td>
      This will match paths starting with `/abc` and `/xyz`:

```ts
app.use(/\/abc|\/xyz/, function (req, res, next) {
  next();
});
```

  </td>
    </tr>
    <tr>
      <td>Array</td>
      <td>
      This will match paths starting with `/abcd`, `/xyza`, `/lmn`, and `/pqr`:

```ts
app.use(["/abcd", "/xyza", /\/lmn|\/pqr/], function (req, res, next) {
  next();
});
```

  </td>
    </tr>
  </tbody>
</table>

##### Middleware callback function examples

The following table provides some simple examples of middleware functions that can be used as the `callback` argument to `app.use()`, `app.METHOD()`, and `app.all()`. Even though the examples are for `app.use()`, they are also valid for `app.use()`, `app.METHOD()`, and `app.all()`.

<table class="doctable">
  <thead>
    <tr>
      <th>Usage</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Single Middleware</td>
      <td>You can define and mount a middleware function locally.

```ts
app.use(function (req, res, next) {
  next();
});
```

A router is valid middleware.

```ts
const router = Router();

router.get("/", function (req, res, next) {
  next();
});

app.use(router);
```

An Opine app is valid middleware.

```ts
const subApp = opine();

subApp.get("/", function (req, res, next) {
  next();
});

app.use(subApp);
```

  </td>
    </tr>
    <tr>
      <td>Series of Middleware</td>
      <td>
        You can specify more than one middleware function at the same mount path.

```ts
const r1 = Router();

r1.get("/", function (req, res, next) {
  next();
});

const r2 = Router();

r2.get("/", function (req, res, next) {
  next();
});

app.use(r1, r2);
```

  </td>
    </tr>
    <tr>
      <td>Array</td>
      <td>
      Use an array to group middleware logically.
      If you pass an array of middleware as the first or only middleware parameters,
      then you <em>must</em> specify the mount path.

```ts
const r1 = Router();

r1.get("/", function (req, res, next) {
  next();
});

const r2 = Router();

r2.get("/", function (req, res, next) {
  next();
});

app.use("/", [r1, r2]);
```

  </td>
    </tr>
    <tr>
      <td>Combination</td>
      <td>
        You can combine all the above ways of mounting middleware.

```ts
function mw1(req, res, next) {
  next();
}
function mw2(req, res, next) {
  next();
}

const r1 = Router();
r1.get("/", function (req, res, next) {
  next();
});

const r2 = Router();

r2.get("/", function (req, res, next) {
  next();
});

const subApp = opine();

subApp.get("/", function (req, res, next) {
  next();
});

app.use(mw1, [mw2, r1, r2], subApp);
```

</td>
</tr>

  </tbody>
</table>
