import { opine, Router } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";
import type { NextFunction, Request, Response } from "../../src/types.ts";

describe("app", function () {
  describe(".param(names, fn)", function () {
    it("should map the array", function (done) {
      const app = opine();

      app.param(["id", "uid"], function (req, res, next, id) {
        id = Number(id);
        if (isNaN(id)) return next("route");
        req.params.id = id;
        next();
      });

      app.get("/post/:id", function (req, res) {
        var id = req.params.id;
        res.send("" + id);
      });

      app.get("/user/:uid", function (req, res) {
        var id = req.params.id;
        res.send("" + id);
      });

      superdeno(app)
        .get("/user/123")
        .expect(200, "123", function (err: any) {
          if (err) return done(err);
          superdeno(app)
            .get("/post/123")
            .expect("123", done);
        });
    });
  });
  describe(".param(name, fn)", function () {
    it("should map logic for a single param", function (done) {
      const app = opine();

      app.param("id", function (req, res, next, id) {
        id = Number(id);
        if (isNaN(id)) return next("route");
        req.params.id = id;
        next();
      });

      app.get("/user/:id", function (req, res) {
        var id = req.params.id;
        res.send("" + id);
      });

      superdeno(app)
        .get("/user/123")
        .expect("123", done);
    });

    it("should only call once per request", function (done) {
      const app = opine();
      var called = 0;
      var count = 0;

      app.param("user", function (req, res, next, user) {
        called++;
        next();
      });

      app.get("/foo/:user", function (req, res, next) {
        count++;
        next();
      });
      app.get("/foo/:user", function (req, res, next) {
        count++;
        next();
      });
      app.use(function (req, res) {
        res.end([count, called].join(" "));
      });

      superdeno(app)
        .get("/foo/bob")
        .expect("2 1", done);
    });

    it("should call when values differ", function (done) {
      const app = opine();
      var called = 0;
      var count = 0;

      app.param("user", function (req, res, next, user) {
        called++;
        let reqx = req as any;
        reqx.users = (reqx.users || []).concat(user);
        next();
      });

      app.get("/:user/bob", function (req, res, next) {
        count++;
        next();
      });
      app.get("/foo/:user", function (req, res, next) {
        count++;
        next();
      });
      app.use(function (req, res) {
        let reqx = req as any;
        res.end([count, called, reqx.users.join(",")].join(" "));
      });

      superdeno(app)
        .get("/foo/bob")
        .expect("2 2 foo,bob", done);
    });

    it("should support altering req.params across routes", function (done) {
      const app = opine();

      app.param("user", function (req, res, next, user) {
        req.params.user = "deno";
        next();
      });

      app.get("/:user", function (req, res, next) {
        next("route");
      });
      app.get("/:user", function (req, res, next) {
        res.send(req.params.user);
      });

      superdeno(app)
        .get("/bob")
        .expect("deno", done);
    });

    it("should not invoke without route handler", function (done) {
      const app = opine();

      app.param("thing", function (req, res, next, thing) {
        req.params.thing = thing;
        next();
      });

      app.param("user", function (req, res, next, user) {
        next(new Error("invalid invokation"));
      });

      app.post("/:user", function (req, res, next) {
        res.send(req.params.user);
      });

      app.get("/:thing", function (req, res, next) {
        res.send(req.params.thing);
      });

      superdeno(app)
        .get("/bob")
        .expect(200, "bob", done);
    });

    it("should work with encoded values", function (done) {
      const app = opine();

      app.param("name", function (req, res, next, name) {
        req.params.name = name;
        next();
      });

      app.get("/user/:name", function (req, res) {
        var name = req.params.name;
        res.send("" + name);
      });

      superdeno(app)
        .get("/user/foo%25bar")
        .expect("foo%bar", done);
    });

    it("should catch thrown error", function (done) {
      const app = opine();

      app.param("id", function (req, res, next, id) {
        throw new Error("err!");
      });

      app.get("/user/:id", function (req, res) {
        var id = req.params.id;
        res.send("" + id);
      });

      superdeno(app)
        .get("/user/123")
        .expect(500, done);
    });

    it("should catch thrown secondary error", function (done) {
      const app = opine();

      app.param("id", function (req, res, next, val) {
        Promise.resolve().then(next);
      });

      app.param("id", function (req, res, next, id) {
        throw new Error("err!");
      });

      app.get("/user/:id", function (req, res) {
        var id = req.params.id;
        res.send("" + id);
      });

      superdeno(app)
        .get("/user/123")
        .expect(500, done);
    });

    it("should defer to next route", function (done) {
      const app = opine();

      app.param("id", function (req, res, next, id) {
        next("route");
      });

      app.get("/user/:id", function (req, res) {
        var id = req.params.id;
        res.send("" + id);
      });

      app.get("/:name/123", function (req, res) {
        res.send("name");
      });

      superdeno(app)
        .get("/user/123")
        .expect("name", done);
    });

    it("should defer all the param routes", function (done) {
      const app = opine();

      app.param("id", function (req, res, next, val) {
        if (val === "new") return next("route");
        return next();
      });

      app.all("/user/:id", function (req, res) {
        res.send("all.id");
      });

      app.get("/user/:id", function (req, res) {
        res.send("get.id");
      });

      app.get("/user/new", function (req, res) {
        res.send("get.new");
      });

      superdeno(app)
        .get("/user/new")
        .expect("get.new", done);
    });

    it("should not call when values differ on error", function (done) {
      const app = opine();
      var called = 0;
      var count = 0;

      app.param("user", function (req, res, next, user) {
        called++;
        if (user === "foo") throw new Error("err!");
        let reqx = req as any;
        reqx.user = user;
        next();
      });

      app.get("/:user/bob", function (req, res, next) {
        count++;
        next();
      });
      app.get("/foo/:user", function (req, res, next) {
        count++;
        next();
      });

      function error(
        err: any,
        req: Request,
        res: Response,
        next: NextFunction,
      ) {
        // respond with custom 500 "Internal Server Error".

        res.setStatus(500);
        res.send([count, called, err.message].join(" "));
      }

      app.use(error);
      superdeno(app)
        .get("/foo/bob")
        .expect(500, "0 1 err!", done);
    });

    it('should call when values differ when using "next"', function (done) {
      const app = opine();
      var called = 0;
      var count = 0;

      app.param("user", function (req, res, next, user) {
        called++;
        if (user === "foo") return next("route");
        const reqx = req as any;
        reqx.user = user;
        next();
      });

      app.get("/:user/bob", function (req, res, next) {
        count++;
        next();
      });
      app.get("/foo/:user", function (req, res, next) {
        count++;
        next();
      });
      app.use(function (req, res) {
        const reqx = req as any;
        res.end([count, called, reqx.user].join(" "));
      });

      superdeno(app)
        .get("/foo/bob")
        .expect("1 2 bob", done);
    });
  });
});
