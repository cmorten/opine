import { opine, Router } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { after, describe, it } from "../utils.ts";
import { methods } from "../../src/methods.ts";
import type { NextFunction, Request, Response } from "../../src/types.ts";

describe("app.router", function () {
  it("should restore req.params after leaving router", function (done) {
    const app = opine();
    const router = Router();

    function handler1(req: Request, res: Response, next: NextFunction) {
      res.set("x-user-id", String(req.params.id));
      next();
    }

    function handler2(req: Request, res: Response) {
      res.send(req.params.id);
    }

    router.use(function (req: Request, res: Response, next: NextFunction) {
      res.set("x-router", String(req.params.id));
      next();
    });

    app.get("/user/:id", handler1, router, handler2);

    superdeno(app)
      .get("/user/1")
      .expect("x-router", "undefined")
      .expect("x-user-id", "1")
      .expect(200, "1", done);
  });

  describe("methods", function () {
    methods.forEach(function (method) {
      if (method === "connect") return;

      it("should include " + method.toUpperCase(), function (done) {
        const app = opine();

        (app as any)[method]("/foo", function (req: Request, res: Response) {
          res.send(method);
        });

        (superdeno(app) as any)[method]("/foo")
          .expect(200, done);
      });

      it("should reject numbers for app." + method, function () {
        const app = opine();
        expect((app as any)[method].bind(app, "/", 3)).toThrow(/Number/);
      });
    });

    it("should re-route when method is altered", function (done) {
      const app = opine();
      const cb = after(3, done);

      app.use(function (req: Request, res: Response, next: NextFunction) {
        if (req.method !== "POST") return next();
        req.method = "DELETE";
        res.set("X-Method-Altered", "1");
        next();
      });

      app.delete("/", function (req: Request, res: Response) {
        res.end("deleted everything");
      });

      superdeno(app)
        .get("/")
        .expect(404, cb);

      superdeno(app)
        .delete("/")
        .expect(200, "deleted everything", cb);

      superdeno(app)
        .post("/")
        .expect("X-Method-Altered", "1")
        .expect(200, "deleted everything", cb);
    });
  });

  describe("decode params", function () {
    it("should decode correct params", function (done) {
      const app = opine();

      app.get(
        "/:name",
        function (req: Request, res: Response, next: NextFunction) {
          res.send(req.params.name);
        },
      );

      superdeno(app)
        .get("/foo%2Fbar")
        .expect("foo/bar", done);
    });

    it("should not accept params in malformed paths", function (done) {
      const app = opine();

      app.get(
        "/:name",
        function (req: Request, res: Response, next: NextFunction) {
          res.send(req.params.name);
        },
      );

      superdeno(app)
        .get("/%foobar")
        .expect(400, done);
    });

    it("should not decode spaces", function (done) {
      const app = opine();

      app.get(
        "/:name",
        function (req: Request, res: Response, next: NextFunction) {
          res.send(req.params.name);
        },
      );

      superdeno(app)
        .get("/foo+bar")
        .expect("foo+bar", done);
    });

    it("should work with unicode", function (done) {
      const app = opine();

      app.get(
        "/:name",
        function (req: Request, res: Response, next: NextFunction) {
          res.send(req.params.name);
        },
      );

      superdeno(app)
        .get("/%ce%b1")
        .expect("\u03b1", done);
    });
  });

  it("should be .use()able", function (done) {
    const app = opine();
    let calls: any[] = [];

    app.use(function (req: Request, res: Response, next: NextFunction) {
      calls.push("before");
      next();
    });

    app.get("/", function (req: Request, res: Response, next: NextFunction) {
      calls.push("GET /");
      next();
    });

    app.use(function (req: Request, res: Response, next: NextFunction) {
      calls.push("after");
      res.json(calls);
    });

    superdeno(app)
      .get("/")
      .expect(200, ["before", "GET /", "after"], done);
  });

  describe("when given a regexp", function () {
    it("should match the pathname only", function (done) {
      const app = opine();

      app.get(/^\/user\/[0-9]+$/, function (req: Request, res: Response) {
        res.end("user");
      });

      superdeno(app)
        .get("/user/12?foo=bar")
        .expect("user", done);
    });

    it("should populate req.params with the captures", function (done) {
      const app = opine();

      app.get(
        /^\/user\/([0-9]+)\/(view|edit)?$/,
        function (req: Request, res: Response) {
          const id = req.params[0],
            op = req.params[1];
          res.end(op + "ing user " + id);
        },
      );

      superdeno(app)
        .get("/user/10/edit")
        .expect("editing user 10", done);
    });
  });

  describe("case sensitivity", function () {
    it("should be disabled by default", function (done) {
      const app = opine();

      app.get("/user", function (req: Request, res: Response) {
        res.end("deno");
      });

      superdeno(app)
        .get("/USER")
        .expect("deno", done);
    });

    describe('when "case sensitive routing" is enabled', function () {
      it("should match identical casing", function (done) {
        const app = opine();

        app.enable("case sensitive routing");

        app.get("/uSer", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/uSer")
          .expect("deno", done);
      });

      it("should not match otherwise", function (done) {
        const app = opine();

        app.enable("case sensitive routing");

        app.get("/uSer", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user")
          .expect(404, done);
      });
    });
  });

  describe("params", function () {
    it("should overwrite existing req.params by default", function (done) {
      const app = opine();
      const router = Router();

      router.get("/:action", function (req: Request, res: Response) {
        res.send(req.params);
      });

      app.use("/user/:user", router);

      superdeno(app)
        .get("/user/1/get")
        .expect(200, '{"action":"get"}', done);
    });

    it("should allow merging existing req.params", function (done) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get("/:action", function (req: Request, res: Response) {
        const keys = Object.keys(req.params).sort();
        res.send(keys.map(function (k) {
          return [k, req.params[k]];
        }));
      });

      app.use("/user/:user", router);

      superdeno(app)
        .get("/user/deno/get")
        .expect(200, '[["action","get"],["user","deno"]]', done);
    });

    it("should use params from router", function (done) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get("/:thing", function (req: Request, res: Response) {
        const keys = Object.keys(req.params).sort();
        res.send(keys.map(function (k) {
          return [k, req.params[k]];
        }));
      });

      app.use("/user/:thing", router);

      superdeno(app)
        .get("/user/deno/get")
        .expect(200, '[["thing","get"]]', done);
    });

    it("should merge numeric indices req.params", function (done) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get("/*.*", function (req: Request, res: Response) {
        const keys = Object.keys(req.params).sort();
        res.send(keys.map(function (k) {
          return [k, req.params[k]];
        }));
      });

      app.use("/user/id:(\\d+)", router);

      superdeno(app)
        .get("/user/id:10/profile.json")
        .expect(200, '[["0","10"],["1","profile"],["2","json"]]', done);
    });

    it("should merge numeric indices req.params when more in parent", function (
      done,
    ) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get("/*", function (req: Request, res: Response) {
        const keys = Object.keys(req.params).sort();
        res.send(keys.map(function (k) {
          return [k, req.params[k]];
        }));
      });

      app.use("/user/id:(\\d+)/name:(\\w+)", router);

      superdeno(app)
        .get("/user/id:10/name:deno/profile")
        .expect(200, '[["0","10"],["1","deno"],["2","profile"]]', done);
    });

    it("should merge numeric indices req.params when parent has same number", function (
      done,
    ) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get("/name:(\\w+)", function (req: Request, res: Response) {
        const keys = Object.keys(req.params).sort();
        res.send(keys.map(function (k) {
          return [k, req.params[k]];
        }));
      });

      app.use("/user/id:(\\d+)", router);

      superdeno(app)
        .get("/user/id:10/name:deno")
        .expect(200, '[["0","10"],["1","deno"]]', done);
    });

    it("should ignore invalid incoming req.params", function (done) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get("/:name", function (req: Request, res: Response) {
        const keys = Object.keys(req.params).sort();
        res.send(keys.map(function (k) {
          return [k, req.params[k]];
        }));
      });

      app.use(
        "/user/",
        function (req: Request, res: Response, next: NextFunction) {
          (req as any).params = 3; // wat?
          router(req, res, next);
        },
      );

      superdeno(app)
        .get("/user/deno")
        .expect(200, '[["name","deno"]]', done);
    });

    it("should restore req.params", function (done) {
      const app = opine();
      const router = new Router({ mergeParams: true });

      router.get(
        "/user:(\\w+)/*",
        function (req: Request, res: Response, next: NextFunction) {
          next();
        },
      );

      app.use(
        "/user/id:(\\d+)",
        function (req: Request, res: Response, next: NextFunction) {
          router(req, res, function (err: any) {
            const keys = Object.keys(req.params).sort();
            res.send(keys.map(function (k) {
              return [k, req.params[k]];
            }));
          });
        },
      );

      superdeno(app)
        .get("/user/id:42/user:deno/profile")
        .expect(200, '[["0","42"]]', done);
    });
  });

  describe("trailing slashes", function () {
    it("should be optional by default", function (done) {
      const app = opine();

      app.get("/user", function (req: Request, res: Response) {
        res.end("deno");
      });

      superdeno(app)
        .get("/user/")
        .expect("deno", done);
    });

    describe('when "strict routing" is enabled', function () {
      it("should match trailing slashes", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.get("/user/", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user/")
          .expect("deno", done);
      });

      it("should pass-though middleware", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.use(function (req: Request, res: Response, next: NextFunction) {
          res.set("x-middleware", "true");
          next();
        });

        app.get("/user/", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user/")
          .expect("x-middleware", "true")
          .expect(200, "deno", done);
      });

      it("should pass-though mounted middleware", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.use(
          "/user/",
          function (req: Request, res: Response, next: NextFunction) {
            res.set("x-middleware", "true");
            next();
          },
        );

        app.get("/user/test/", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user/test/")
          .expect("x-middleware", "true")
          .expect(200, "deno", done);
      });

      it("should match no slashes", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.get("/user", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user")
          .expect("deno", done);
      });

      it("should match middleware when omitting the trailing slash", function (
        done,
      ) {
        const app = opine();

        app.enable("strict routing");

        app.use("/user/", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user")
          .expect(200, "deno", done);
      });

      it("should match middleware", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.use("/user", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user")
          .expect(200, "deno", done);
      });

      it("should match middleware when adding the trailing slash", function (
        done,
      ) {
        const app = opine();

        app.enable("strict routing");

        app.use("/user", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user/")
          .expect(200, "deno", done);
      });

      it("should fail when omitting the trailing slash", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.get("/user/", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user")
          .expect(404, done);
      });

      it("should fail when adding the trailing slash", function (done) {
        const app = opine();

        app.enable("strict routing");

        app.get("/user", function (req: Request, res: Response) {
          res.end("deno");
        });

        superdeno(app)
          .get("/user/")
          .expect(404, done);
      });
    });
  });

  it("should allow escaped regexp", function (done) {
    const app = opine();

    app.get("/user/\\d+", function (req: Request, res: Response) {
      res.end("woot");
    });

    superdeno(app)
      .get("/user/10")
      .expect(200, function (err: any) {
        if (err) return done(err);
        superdeno(app)
          .get("/user/deno")
          .expect(404, done);
      });
  });

  it('should allow literal "."', function (done) {
    const app = opine();

    app.get("/api/users/:from..:to", function (req: Request, res: Response) {
      const from = req.params.from;
      const to = req.params.to;

      res.end("users from " + from + " to " + to);
    });

    superdeno(app)
      .get("/api/users/1..50")
      .expect("users from 1 to 50", done);
  });

  describe("*", function () {
    it("should capture everything", function (done) {
      const app = opine();

      app.get("*", function (req: Request, res: Response) {
        res.end(req.params[0]);
      });

      superdeno(app)
        .get("/user/deno.json")
        .expect("/user/deno.json", done);
    });

    it("should decode the capture", function (done) {
      const app = opine();

      app.get("*", function (req: Request, res: Response) {
        res.end(req.params[0]);
      });

      superdeno(app)
        .get("/user/deno%20and%20superdeno.json")
        .expect("/user/deno and superdeno.json", done);
    });

    it("should denote a greedy capture group", function (done) {
      const app = opine();

      app.get("/user/*.json", function (req: Request, res: Response) {
        res.end(req.params[0]);
      });

      superdeno(app)
        .get("/user/deno.json")
        .expect("deno", done);
    });

    it("should work with several", function (done) {
      const app = opine();

      app.get("/api/*.*", function (req: Request, res: Response) {
        const resource = req.params[0];
        const format = req.params[1];
        res.end(resource + " as " + format);
      });

      superdeno(app)
        .get("/api/users/foo.bar.json")
        .expect("users/foo.bar as json", done);
    });

    it("should work cross-segment", function (done) {
      const app = opine();

      app.get("/api*", function (req: Request, res: Response) {
        res.send(req.params[0]);
      });

      superdeno(app)
        .get("/api")
        .expect("", function () {
          superdeno(app)
            .get("/api/hey")
            .expect("/hey", done);
        });
    });

    it("should allow naming", function (done) {
      const app = opine();

      app.get("/api/:resource(*)", function (req: Request, res: Response) {
        const resource = req.params.resource;
        res.end(resource);
      });

      superdeno(app)
        .get("/api/users/0.json")
        .expect("users/0.json", done);
    });

    it("should not be greedy immediately after param", function (done) {
      const app = opine();

      app.get("/user/:user*", function (req: Request, res: Response) {
        res.end(req.params.user);
      });

      superdeno(app)
        .get("/user/122")
        .expect("122", done);
    });

    it("should eat everything after /", function (done) {
      const app = opine();

      app.get("/user/:user*", function (req: Request, res: Response) {
        res.end(req.params.user);
      });

      superdeno(app)
        .get("/user/122/aaa")
        .expect("122", done);
    });

    it("should span multiple segments", function (done) {
      const app = opine();

      app.get("/file/*", function (req: Request, res: Response) {
        res.end(req.params[0]);
      });

      superdeno(app)
        .get("/file/javascripts/jquery.js")
        .expect("javascripts/jquery.js", done);
    });

    it("should be optional", function (done) {
      const app = opine();

      app.get("/file/*", function (req: Request, res: Response) {
        res.end(req.params[0]);
      });

      superdeno(app)
        .get("/file/")
        .expect("", done);
    });

    it("should require a preceding /", function (done) {
      const app = opine();

      app.get("/file/*", function (req: Request, res: Response) {
        res.end(req.params[0]);
      });

      superdeno(app)
        .get("/file")
        .expect(404, done);
    });

    it("should keep correct parameter indexes", function (done) {
      const app = opine();

      app.get("/*/user/:id", function (req: Request, res: Response) {
        res.send(req.params);
      });

      superdeno(app)
        .get("/1/user/2")
        .expect(200, '{"0":"1","id":"2"}', done);
    });

    it("should work within arrays", function (done) {
      const app = opine();

      app.get(
        ["/user/:id", "/foo/*", "/:bar"],
        function (req: Request, res: Response) {
          res.send(req.params.bar);
        },
      );

      superdeno(app)
        .get("/test")
        .expect(200, "test", done);
    });
  });

  describe(":name", function () {
    it("should denote a capture group", function (done) {
      const app = opine();

      app.get("/user/:user", function (req: Request, res: Response) {
        res.end(req.params.user);
      });

      superdeno(app)
        .get("/user/deno")
        .expect("deno", done);
    });

    it("should match a single segment only", function (done) {
      const app = opine();

      app.get("/user/:user", function (req: Request, res: Response) {
        res.end(req.params.user);
      });

      superdeno(app)
        .get("/user/deno/edit")
        .expect(404, done);
    });

    it("should allow several capture groups", function (done) {
      const app = opine();

      app.get("/user/:user/:op", function (req: Request, res: Response) {
        res.end(req.params.op + "ing " + req.params.user);
      });

      superdeno(app)
        .get("/user/deno/edit")
        .expect("editing deno", done);
    });

    it("should work following a partial capture group", function (done) {
      const app = opine();
      const cb = after(2, done);

      app.get("/user(s)?/:user/:op", function (req: Request, res: Response) {
        res.end(
          req.params.op + "ing " + req.params.user +
            (req.params[0] ? " (old)" : ""),
        );
      });

      superdeno(app)
        .get("/user/deno/edit")
        .expect("editing deno", cb);

      superdeno(app)
        .get("/users/deno/edit")
        .expect("editing deno (old)", cb);
    });

    it("should work inside literal parenthesis", function (done) {
      const app = opine();

      app.get("/:user\\(:op\\)", function (req: Request, res: Response) {
        res.end(req.params.op + "ing " + req.params.user);
      });

      superdeno(app)
        .get("/deno(edit)")
        .expect("editing deno", done);
    });

    it("should work in array of paths", function (done) {
      const app = opine();
      const cb = after(2, done);

      app.get(
        ["/user/:user/poke", "/user/:user/pokes"],
        function (req: Request, res: Response) {
          res.end("poking " + req.params.user);
        },
      );

      superdeno(app)
        .get("/user/deno/poke")
        .expect("poking deno", cb);

      superdeno(app)
        .get("/user/deno/pokes")
        .expect("poking deno", cb);
    });
  });

  describe(":name?", function () {
    it("should denote an optional capture group", function (done) {
      const app = opine();

      app.get("/user/:user/:op?", function (req: Request, res: Response) {
        const op = req.params.op || "view";
        res.end(op + "ing " + req.params.user);
      });

      superdeno(app)
        .get("/user/deno")
        .expect("viewing deno", done);
    });

    it("should populate the capture group", function (done) {
      const app = opine();

      app.get("/user/:user/:op?", function (req: Request, res: Response) {
        const op = req.params.op || "view";
        res.end(op + "ing " + req.params.user);
      });

      superdeno(app)
        .get("/user/deno/edit")
        .expect("editing deno", done);
    });
  });

  describe(".:name", function () {
    it("should denote a format", function (done) {
      const app = opine();

      app.get("/:name.:format", function (req: Request, res: Response) {
        res.end(req.params.name + " as " + req.params.format);
      });

      superdeno(app)
        .get("/foo.json")
        .expect("foo as json", function () {
          superdeno(app)
            .get("/foo")
            .expect(404, done);
        });
    });
  });

  describe(".:name?", function () {
    it("should denote an optional format", function (done) {
      const app = opine();

      app.get("/:name.:format?", function (req: Request, res: Response) {
        res.end(req.params.name + " as " + (req.params.format || "html"));
      });

      superdeno(app)
        .get("/foo")
        .expect("foo as html", function () {
          superdeno(app)
            .get("/foo.json")
            .expect("foo as json", done);
        });
    });
  });

  describe("when next() is called", function () {
    it("should continue lookup", function (done) {
      const app = opine();
      const calls: any[] = [];

      app.get(
        "/foo/:bar?",
        function (req: Request, res: Response, next: NextFunction) {
          calls.push("/foo/:bar?");
          next();
        },
      );

      app.get("/bar", function (req: Request, res: Response) {
        throw new Error("should not be called");
      });

      app.get(
        "/foo",
        function (req: Request, res: Response, next: NextFunction) {
          calls.push("/foo");
          next();
        },
      );

      app.get(
        "/foo",
        function (req: Request, res: Response, next: NextFunction) {
          calls.push("/foo 2");
          res.json(calls);
        },
      );

      superdeno(app)
        .get("/foo")
        .expect(200, ["/foo/:bar?", "/foo", "/foo 2"], done);
    });
  });

  describe('when next("route") is called', function () {
    it("should jump to next route", function (done) {
      const app = opine();

      function fn(req: Request, res: Response, next: NextFunction) {
        res.set("X-Hit", "1");
        next("route");
      }

      app.get(
        "/foo",
        fn,
        function (req: Request, res: Response, next: NextFunction) {
          res.end("failure");
        },
      );

      app.get("/foo", function (req: Request, res: Response) {
        res.end("success");
      });

      superdeno(app)
        .get("/foo")
        .expect("X-Hit", "1")
        .expect(200, "success", done);
    });
  });

  describe('when next("router") is called', function () {
    it("should jump out of router", function (done) {
      const app = opine();
      const router = Router();

      function fn(req: Request, res: Response, next: NextFunction) {
        res.set("X-Hit", "1");
        next("router");
      }

      router.get(
        "/foo",
        fn,
        function (req: Request, res: Response, next: NextFunction) {
          res.end("failure");
        },
      );

      router.get(
        "/foo",
        function (req: Request, res: Response, next: NextFunction) {
          res.end("failure");
        },
      );

      app.use(router);

      app.get("/foo", function (req: Request, res: Response) {
        res.end("success");
      });

      superdeno(app)
        .get("/foo")
        .expect("X-Hit", "1")
        .expect(200, "success", done);
    });
  });

  describe("when next(err) is called", function () {
    it("should break out of app.router", function (done) {
      const app = opine();
      const calls: any[] = [];

      app.get(
        "/foo/:bar?",
        function (req: Request, res: Response, next: NextFunction) {
          calls.push("/foo/:bar?");
          next();
        },
      );

      app.get("/bar", function (req: Request, res: Response) {
        throw new Error("should not be called");
      });

      app.get(
        "/foo",
        function (req: Request, res: Response, next: NextFunction) {
          calls.push("/foo");
          next(new Error("fail"));
        },
      );

      app.get(
        "/foo",
        function (req: Request, res: Response, next: NextFunction) {
          throw new Error("should not be called");
        },
      );

      app.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          res.json({
            calls: calls,
            error: err.message,
          });
        },
      );

      superdeno(app)
        .get("/foo")
        .expect(200, { calls: ["/foo/:bar?", "/foo"], error: "fail" }, done);
    });

    it("should call handler in same route, if exists", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        next(new Error("boom!"));
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.send("foo here");
      }

      function fn3(err: any, req: Request, res: Response, next: NextFunction) {
        res.send("route go " + err.message);
      }

      app.get("/foo", fn1, fn2, fn3);

      app.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          res.end("error!");
        },
      );

      superdeno(app)
        .get("/foo")
        .expect("route go boom!", done);
    });
  });

  it("should allow rewriting of the url", function (done) {
    const app = opine();

    app.get(
      "/account/edit",
      function (req: Request, res: Response, next: NextFunction) {
        (req as any).user = { id: 12 }; // faux authenticated user
        req.url = "/user/" + (req as any).user.id + "/edit";
        next();
      },
    );

    app.get("/user/:id/edit", function (req: Request, res: Response) {
      res.send("editing user " + req.params.id);
    });

    superdeno(app)
      .get("/account/edit")
      .expect("editing user 12", done);
  });

  it("should run in order added", function (done) {
    const app = opine();
    const path: any[] = [];

    app.get("*", function (req: Request, res: Response, next: NextFunction) {
      path.push(0);
      next();
    });

    app.get(
      "/user/:id",
      function (req: Request, res: Response, next: NextFunction) {
        path.push(1);
        next();
      },
    );

    app.use(function (req: Request, res: Response, next: NextFunction) {
      path.push(2);
      next();
    });

    app.all(
      "/user/:id",
      function (req: Request, res: Response, next: NextFunction) {
        path.push(3);
        next();
      },
    );

    app.get("*", function (req: Request, res: Response, next: NextFunction) {
      path.push(4);
      next();
    });

    app.use(function (req: Request, res: Response, next: NextFunction) {
      path.push(5);
      res.end(path.join(","));
    });

    superdeno(app)
      .get("/user/1")
      .expect(200, "0,1,2,3,4,5", done);
  });

  it("should be chainable", function () {
    const app = opine();
    expect(app.get("/", function () {})).toEqual(app);
  });
});
