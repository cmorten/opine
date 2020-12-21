# 1.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## Router([options])

A `router` object is an isolated instance of middleware and routes. You can think of it as a "mini-application" capable only of performing middleware and routing functions. Every Opine application has a built-in app router.

A router behaves like middleware itself, so you can use it as an argument to [app.use()](./application.md#appusepath-callback--callback) or as the argument to another router's [use()](#routerusepath-function--function) method.

Opine has a top-level named function export `Router()` that creates a new `router` object.

```ts
import { Router } from "https://deno.land/x/opine@1.0.0/mod.ts";

const router = Router(options);
```

The optional `options` parameter specifies the behavior of the router.

| Property        | Description                                                                                                                                           | Default                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `caseSensitive` | Enable case sensitivity.                                                                                                                              | Disabled by default, treating "/Foo" and "/foo" as the same.                |
| `mergeParams`   | Preserve the `req.params` values from the parent router. If the parent and the child have conflicting param names, the child's value take precedence. | `false`                                                                     |
| `strict`        | Enable strict routing.                                                                                                                                | Disabled by default, "/foo" and "/foo/" are treated the same by the router. |

Once you've created a router object, you can add middleware and HTTP method routes (such as `get`, `put`, `post`, and so on) to it just like an application. For example:

```ts
// invoked for any requests passed to this router
router.use(function (req, res, next) {
  // .. some logic here .. like any other middleware
  next();
});

// will handle any request that ends in /events
// depends on where the router is "use()'d"
router.get("/events", function (req, res, next) {
  // ..
});
```

You can then use a router for a particular root URL in this way separating your routes into files or even mini-apps.

```ts
// only requests to /calendar/* will be sent to our "router"
app.use("/calendar", router);
```

### Methods

#### router.all(path, [callback, ...] callback)

This method is just like the `router.METHOD()` methods, except that it matches all HTTP methods (verbs).

This method is extremely useful for mapping "global" logic for specific path prefixes or arbitrary matches. For example, if you placed the following route at the top of all other route definitions, it would require that all routes from that point on would require authentication, and automatically load a user. Keep in mind that these callbacks do not have to act as end points; `loadUser` can perform a task, then call `next()` to continue matching subsequent routes.

```ts
router.all("*", requireAuthentication, loadUser);
```

Or the equivalent:

```ts
router.all("*", requireAuthentication);
router.all("*", loadUser);
```

Another example of this is white-listed "global" functionality. Here the example is much like before, but it only restricts paths prefixed with "/api":

```ts
router.all("/api/*", requireAuthentication);
```

#### router.METHOD(path, [callback, ...] callback)

The `router.METHOD()` methods provide the routing functionality in Opine, where METHOD is one of the HTTP methods, such as GET, PUT, POST, and so on, in lowercase. Thus, the actual methods are `router.get()`, `router.post()`, `router.put()`, and so on.

> The `router.get()` function is automatically called for the HTTP `HEAD` method in addition to the `GET` method if `router.head()` was not called for the path before `router.get()`.

You can provide multiple callbacks, and all are treated equally, and behave just like middleware, except that these callbacks may invoke `next('route')` to bypass the remaining route callback(s). You can use this mechanism to perform pre-conditions on a route then pass control to subsequent routes when there is no reason to proceed with the route matched.

The following snippet illustrates the most simple route definition possible. Opine translates the path strings to regular expressions, used internally to match incoming requests. Query strings are _not_ considered when performing these matches, for example "GET /" would match the following route, as would "GET /?name=deno".

```ts
router.get("/", function (req, res) {
  res.send("hello world");
});
```

You can also use regular expressions - useful if you have very specific constraints, for example the following would match "GET /commits/71dbb9c" as well as "GET /commits/71dbb9c..4c084f9".

```ts
router.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function (req, res) {
  const from = req.params[0];
  const to = req.params[1] || "HEAD";
  res.send("commit range " + from + ".." + to);
});
```

#### router.param(name, callback)

Adds callback triggers to route parameters, where `name` is the name of the parameter and `callback` is the callback function.

The parameters of the callback function are:

- `req`, the request object.
- `res`, the response object.
- `next`, indicating the next middleware function.
- The value of the `name` parameter.
- The name of the parameter.

> Unlike `app.param()`, `router.param()` does not accept an array of route parameters.

For example, when `:user` is present in a route path, you may map user loading logic to automatically provide `res.locals.user` to the route, or perform validations on the parameter input.

```ts
router.param("user", function (req, res, next, id) {
  // try to get the user details from the User model and attach it to the request object
  User.find(id, function (err, user) {
    if (err) {
      next(err);
    } else if (user) {
      res.locals.user = user;
      next();
    } else {
      next(new Error("failed to load user"));
    }
  });
});
```

Param callback functions are local to the router on which they are defined. They are not inherited by mounted apps or routers. Hence, param callbacks defined on `router` will be triggered only by route parameters defined on `router` routes.

A param callback will be called only once in a request-response cycle, even if the parameter is matched in multiple routes, as shown in the following examples.

```ts
router.param("id", function (req, res, next, id) {
  console.log("CALLED ONLY ONCE");
  next();
});

router.get("/user/:id", function (req, res, next) {
  console.log("although this matches");
  next();
});

router.get("/user/:id", function (req, res) {
  console.log("and this matches too");
  res.end();
});
```

On `GET /user/42`, the following is printed:

```sh
CALLED ONLY ONCE
although this matches
and this matches too
```

#### router.route(path)

Returns an instance of a single route which you can then use to handle HTTP verbs with optional middleware. Use `router.route()` to avoid duplicate route naming and thus typing errors.

The following code shows how to use `router.route()` to specify various HTTP method handlers.

```ts
const router = Router();

router
  .route("/users/:user_id")
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    req.user = {
      id: req.params.user_id,
      name: "deno",
    };

    next();
  })
  .get(function (req, res, next) {
    res.json(req.user);
  })
  .put(function (req, res, next) {
    // just an example of maybe updating the user
    req.user.name = req.params.name;
    // save user ... etc
    res.json(req.user);
  })
  .post(function (req, res, next) {
    next(new Error("not implemented"));
  })
  .delete(function (req, res, next) {
    next(new Error("not implemented"));
  });
```

This approach re-uses the single `/users/:user_id` path and adds handlers for various HTTP methods.

> NOTE: When you use `router.route()`, middleware ordering is based on when the _route_ is created, not when method handlers are added to the route. For this purpose, you can consider method handlers to belong to the route to which they were added.

#### router.use([path], [function, ...] function)

Uses the specified middleware function or functions, with optional mount path `path`, that defaults to "/".

This method is similar to [app.use()](./application#appusepath-callback--callback). A simple example and use case is described below. See [app.use()](./application#appusepath-callback--callback) for more information.

Middleware is like a plumbing pipe: requests start at the first middleware function defined and work their way "down" the middleware stack processing for each path they match.

```ts
import opine, { Router } from "https://deno.land/x/opine@1.0.0/mod.ts";

const app = opine();
const router = Router();

// simple logger for this router's requests
// all requests to this router will first hit this middleware
router.use(function (req, res, next) {
  console.log("%s %s %s", req.method, req.url, req.path);
  next();
});

// this will only be invoked if the path starts with /bar from the mount point
router.use("/bar", function (req, res, next) {
  // ... maybe some additional /bar logging ...
  next();
});

// always invoked
router.use(function (req, res, next) {
  res.send("Hello World");
});

app.use("/foo", router);

app.listen({ port: 3000 });
```

The "mount" path is stripped and is _not_ visible to the middleware function. The main effect of this feature is that a mounted middleware function may operate without code changes regardless of its "prefix" pathname.

The order in which you define middleware with `router.use()` is very important. They are invoked sequentially, thus the order defines middleware precedence. For example, usually a logger is the very first middleware you would use, so that every request gets logged.

```ts
router.use((req, res, next) => {
  const { method, originalUrl, query } = req;
  console.log({ method, originalUrl, query });
  next();
});
router.get("/deno", function (req, res) {
  res.send("Hello Deno");
});
router.use(function (req, res) {
  res.send("Hello");
});
```

Now suppose you wanted to ignore logging requests for the "/deno" endpoint, but to continue logging routes and middleware defined after `logger()`. You would simply move the call to "/deno" to the top, before adding the logger middleware:

```ts
router.get("/deno", function (req, res) {
  res.send("Hello Deno");
});
router.use((req, res, next) => {
  const { method, originalUrl, query } = req;
  console.log({ method, originalUrl, query });
  next();
});
router.use(function (req, res) {
  res.send("Hello");
});
```

**NOTE**: Although these middleware functions are added via a particular router, _when_ they run is defined by the path they are attached to (not the router). Therefore, middleware added via one router may run for other routers if its routes
match. For example, this code shows two different routers mounted on the same path:

```ts
const authRouter = Router();
const openRouter = Router();

authRouter.use((await import("./authenticate")).basic(usersDb));

authRouter.get("/:user_id/edit", function (req, res, next) {
  // ... Edit user UI ...
});
openRouter.get("/", function (req, res, next) {
  // ... List users ...
});
openRouter.get("/:user_id", function (req, res, next) {
  // ... View user ...
});

app.use("/users", authRouter);
app.use("/users", openRouter);
```

Even though the authentication middleware was added via the `authRouter` it will run on the routes defined by the `openRouter` as well since both routers were mounted on `/users`. To avoid this behavior, use different paths for each router.
