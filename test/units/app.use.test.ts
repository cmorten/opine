import opine from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it, after } from "../utils.ts";
import type { Request, Response, NextFunction } from "../../src/types.ts";

describe("app", function () {
  it('should emit "mount" when mounted', function (done) {
    const blog = opine();
    const app = opine();

    blog.on("mount", function (arg) {
      expect(arg).toEqual(app);
      done();
    });

    app.use(blog);
  });

  describe(".use(app)", function () {
    it("should mount the app", function (done) {
      const blog = opine();
      const app = opine();

      blog.get("/blog", function (req, res) {
        res.end("blog");
      });

      app.use(blog);

      superdeno(app)
        .get("/blog")
        .expect("blog", done);
    });

    it("should support mount-points", function (done) {
      const blog = opine();
      const forum = opine();
      const app = opine();

      blog.get("/", function (req, res) {
        res.end("blog");
      });

      forum.get("/", function (req, res) {
        res.end("forum");
      });

      app.use("/blog", blog);
      app.use("/forum", forum);

      superdeno(app)
        .get("/blog")
        .expect("blog", function () {
          superdeno(app)
            .get("/forum")
            .expect("forum", done);
        });
    });

    it("should set the child's .parent", function () {
      const blog = opine();
      const app = opine();

      app.use("/blog", blog);
      expect(blog.parent).toEqual(app);
    });

    it("should support dynamic routes", function (done) {
      const blog = opine();
      const app = opine();

      blog.get("/", function (req, res) {
        res.end("success");
      });

      app.use("/post/:article", blog);

      superdeno(app)
        .get("/post/once-upon-a-time")
        .expect("success", done);
    });

    it("should support mounted app anywhere", function (done) {
      const cb = after(3, done);
      const blog = opine();
      const other = opine();
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      blog.get("/", function (req, res) {
        res.end("success");
      });

      blog.on("mount", function (parent: any) {
        expect(parent).toEqual(app);
        cb();
      });
      other.on("mount", function (parent: any) {
        expect(parent).toEqual(app);
        cb();
      });

      app.use("/post/:article", fn1, other, fn2, blog);

      superdeno(app)
        .get("/post/once-upon-a-time")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("success", cb);
    });
  });

  describe(".use(middleware)", function () {
    it("should accept multiple arguments", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      app.use(fn1, fn2, function fn3(req, res) {
        res.set("x-fn-3", "hit");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should invoke middleware for all requests", function (done) {
      const app = opine();
      const cb = after(3, done);

      app.use(function (req, res) {
        res.send("saw " + req.method + " " + req.url);
      });

      superdeno(app)
        .get("/")
        .expect(200, "saw GET /", cb);

      superdeno(app)
        .options("/")
        .expect(200, "saw OPTIONS /", cb);

      superdeno(app)
        .post("/foo")
        .expect(200, "saw POST /foo", cb);
    });

    it("should accept array of middleware", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.end();
      }

      app.use([fn1, fn2, fn3]);

      superdeno(app)
        .get("/")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should accept multiple arrays of middleware", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.end();
      }

      app.use([fn1, fn2], [fn3]);

      superdeno(app)
        .get("/")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should accept nested arrays of middleware", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.end();
      }

      (app.use as any)([[fn1], fn2], [fn3]);

      superdeno(app)
        .get("/")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });
  });

  describe(".use(path, middleware)", function () {
    it("should require middleware", function () {
      const app = opine();
      expect(function () {
        app.use("/");
      }).toThrow(/requires a middleware function/);
    });

    it("should reject string as middleware", function () {
      const app = opine();
      expect(function () {
        app.use("/", "foo" as any);
      }).toThrow(/requires a middleware function but got a string/);
    });

    it("should reject number as middleware", function () {
      const app = opine();
      expect(function () {
        app.use("/", 42 as any);
      }).toThrow(/requires a middleware function but got a number/);
    });

    it("should reject null as middleware", function () {
      const app = opine();
      expect(function () {
        app.use("/", null as any);
      }).toThrow(/requires a middleware function but got a Null/);
    });

    it("should reject Date as middleware", function () {
      const app = opine();
      expect(function () {
        app.use("/", new Date() as any);
      }).toThrow(/requires a middleware function but got a Date/);
    });

    it("should strip path from req.url", function (done) {
      const app = opine();

      app.use("/foo", function (req, res) {
        res.send("saw " + req.method + " " + req.url);
      });

      superdeno(app)
        .get("/foo/bar")
        .expect(200, "saw GET /bar", done);
    });

    it("should accept multiple arguments", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      app.use("/foo", fn1, fn2, function fn3(req, res) {
        res.set("x-fn-3", "hit");
        res.end();
      });

      superdeno(app)
        .get("/foo")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should invoke middleware for all requests starting with path", function (
      done,
    ) {
      const app = opine();
      const cb = after(3, done);

      app.use("/foo", function (req, res) {
        res.send("saw " + req.method + " " + req.url);
      });

      superdeno(app)
        .get("/")
        .expect(404, cb);

      superdeno(app)
        .post("/foo")
        .expect(200, "saw POST /", cb);

      superdeno(app)
        .post("/foo/bar")
        .expect(200, "saw POST /bar", cb);
    });

    it("should work if path has trailing slash", function (done) {
      const app = opine();
      const cb = after(3, done);

      app.use("/foo/", function (req, res) {
        res.send("saw " + req.method + " " + req.url);
      });

      superdeno(app)
        .get("/")
        .expect(404, cb);

      superdeno(app)
        .post("/foo")
        .expect(200, "saw POST /", cb);

      superdeno(app)
        .post("/foo/bar")
        .expect(200, "saw POST /bar", cb);
    });

    it("should accept array of middleware", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.end();
      }

      app.use("/foo", [fn1, fn2, fn3]);

      superdeno(app)
        .get("/foo")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should accept multiple arrays of middleware", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.end();
      }

      app.use("/foo", [fn1, fn2], [fn3]);

      superdeno(app)
        .get("/foo")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should accept nested arrays of middleware", function (done) {
      const app = opine();

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.end();
      }

      (app.use as any)("/foo", [fn1, [fn2]], [fn3]);

      superdeno(app)
        .get("/foo")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, done);
    });

    it("should support array of paths", function (done) {
      const app = opine();
      const cb = after(3, done);

      app.use(["/foo/", "/bar"], function (req, res) {
        res.send(
          "saw " + req.method + " " + req.url + " through " + req.originalUrl,
        );
      });

      superdeno(app)
        .get("/")
        .expect(404, cb);

      superdeno(app)
        .get("/foo")
        .expect(200, "saw GET / through /foo", cb);

      superdeno(app)
        .get("/bar")
        .expect(200, "saw GET / through /bar", cb);
    });

    it("should support array of paths with middleware array", function (done) {
      const app = opine();
      const cb = after(2, done);

      function fn1(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-1", "hit");
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-2", "hit");
        next();
      }

      function fn3(req: Request, res: Response, next: NextFunction) {
        res.set("x-fn-3", "hit");
        res.send(
          "saw " + req.method + " " + req.url + " through " + req.originalUrl,
        );
      }

      (app.use as any)(["/foo/", "/bar"], [[fn1], fn2], [fn3]);

      superdeno(app)
        .get("/foo")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, "saw GET / through /foo", cb);

      superdeno(app)
        .get("/bar")
        .expect("x-fn-1", "hit")
        .expect("x-fn-2", "hit")
        .expect("x-fn-3", "hit")
        .expect(200, "saw GET / through /bar", cb);
    });

    it("should support regexp path", function (done) {
      const app = opine();
      const cb = after(4, done);

      app.use(/^\/[a-z]oo/, function (req, res) {
        res.send(
          "saw " + req.method + " " + req.url + " through " + req.originalUrl,
        );
      });

      superdeno(app)
        .get("/")
        .expect(404, cb);

      superdeno(app)
        .get("/foo")
        .expect(200, "saw GET / through /foo", cb);

      superdeno(app)
        .get("/zoo/bear")
        .expect(200, "saw GET /bear through /zoo/bear", cb);

      superdeno(app)
        .get("/get/zoo")
        .expect(404, cb);
    });

    it("should support empty string path", function (done) {
      const app = opine();

      app.use("", function (req, res) {
        res.send(
          "saw " + req.method + " " + req.url + " through " + req.originalUrl,
        );
      });

      superdeno(app)
        .get("/")
        .expect(200, "saw GET / through /", done);
    });
  });
});
