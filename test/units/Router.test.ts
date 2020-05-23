import { Router } from "../../mod.ts";
import { expect } from "../deps.ts";
import { methods } from "../../src/methods.ts";
import { describe, it } from "../utils.ts";
import { Request, Response, NextFunction } from "../../src/types.ts";

describe("Router", function () {
  it("should return a function with router methods", function () {
    const router = new Router();

    expect(typeof router === "function").toBeTruthy();
    expect(typeof router.get === "function").toBeTruthy();
    expect(typeof router.handle === "function").toBeTruthy();
    expect(typeof router.use === "function").toBeTruthy();
  });

  it("should support .use of other routers", function (done) {
    const router = new Router();
    const another = new Router();

    another.get("/bar", function (req: Request, res: Response) {
      res.end();
    });

    router.use("/foo", another);
    router.handle(
      { url: "/foo/bar", method: "GET" },
      { end: done },
    );
  });

  it("should support dynamic routes", function (done) {
    const router = new Router();
    const another = new Router();

    another.get("/:bar", function (req: Request, res: Response) {
      expect(req.params.bar).toEqual("route");
      res.end();
    });

    router.use("/:foo", another);

    router.handle(
      { url: "/test/route", method: "GET" },
      { end: done },
    );
  });

  it("should handle blank URL", function (done) {
    const router = new Router();

    router.use(function (req: Request, res: Response) {
      done(new Error("'route.use' should not be called"));
    });

    router.handle({ url: "", method: "GET" }, {}, done);
  });

  it("should handle missing URL", function (done) {
    const router = new Router();

    router.use(function (req: Request, res: Response) {
      throw new Error("'router.use' should not be called");
    });

    router.handle({ method: "GET" }, {}, done);
  });

  it("should not stack overflow with many registered routes", function (done) {
    const handler = function (req: Request, res: Response) {
      done(new Error("wrong handler"));
    };
    const router = new Router();

    for (let i = 0; i < 6000; i++) {
      router.get("/thing" + i, handler);
    }

    router.get("/", function (req: Request, res: Response) {
      res.end();
    });

    router.handle(
      { url: "/", method: "GET" },
      { end: done },
    );
  });

  describe(".handle", function () {
    it("should dispatch", function (done) {
      const router = new Router();

      router.route("/foo").get(function (req: Request, res: Response) {
        res.send("foo");
      });

      const res = {
        send: function (val: any) {
          expect(val).toEqual("foo");
          done();
        },
      };
      router.handle(
        { url: "/foo", method: "GET" },
        res,
      );
    });
  });

  describe(".multiple callbacks", function () {
    it("should throw if a callback is null", function () {
      expect(function () {
        const router = new Router();
        router.route("/foo").all(null);
      }).toThrow();
    });

    it("should throw if a callback is undefined", function () {
      expect(function () {
        const router = new Router();
        router.route("/foo").all(undefined);
      }).toThrow();
    });

    it("should throw if a callback is not a function", function () {
      expect(function () {
        const router = new Router();
        router.route("/foo").all("not a function");
      }).toThrow();
    });

    it("should not throw if all callbacks are functions", function () {
      const router = new Router();
      router.route("/foo").all(function () {}).all(function () {});
    });
  });

  describe("error", function () {
    it("should skip non error middleware", function (done) {
      const router = new Router();

      router.get(
        "/foo",
        function (req: Request, res: Response, next: NextFunction) {
          next(new Error("foo"));
        },
      );

      router.get(
        "/bar",
        function (req: Request, res: Response, next: NextFunction) {
          next(new Error("bar"));
        },
      );

      router.use(function (req: Request, res: Response, next: NextFunction) {
        throw new Error("non error middleware should not be called");
      });

      router.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          expect(err.message).toEqual("foo");
          done();
        },
      );

      router.handle(
        { url: "/foo", method: "GET" },
        {},
        done,
      );
    });

    it("should handle throwing inside routes with params", function (done) {
      var router = new Router();

      router.get(
        "/foo/:id",
        function (req: Request, res: Response, next: NextFunction) {
          throw new Error("foo");
        },
      );

      router.use(function (req: Request, res: Response, next: NextFunction) {
        throw new Error("non error middleware should not be called");
      });

      router.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          expect(err.message).toEqual("foo");
          done();
        },
      );

      router.handle(
        { url: "/foo/2", method: "GET" },
        {},
        function () {},
      );
    });

    it("should handle throwing inside error handlers", function (done) {
      const router = new Router();

      router.use(function (req: Request, res: Response, next: NextFunction) {
        throw new Error("boom!");
      });

      router.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          throw new Error("oops");
        },
      );

      router.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          expect(err.message).toEqual("oops");
          done();
        },
      );

      router.handle(
        { url: "/", method: "GET" },
        {},
        done,
      );
    });
  });

  describe("FQDN", function () {
    it("should not obscure FQDNs", function (done) {
      const request = { hit: 0, url: "http://example.com/foo", method: "GET" };
      const router = new Router();

      router.use(function (req: Request, res: Response, next: NextFunction) {
        expect((req as any).hit++).toEqual(0);
        expect(req.url).toEqual("http://example.com/foo");
        next();
      });

      router.handle(request, {}, function (err: any) {
        if (err) return done(err);
        expect(request.hit).toEqual(1);
        done();
      });
    });

    it("should ignore FQDN in search", function (done) {
      const request = {
        hit: 0,
        url: "/proxy?url=http://example.com/blog/post/1",
        method: "GET",
      };
      const router = new Router();

      router.use(
        "/proxy",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(0);
          expect(req.url).toEqual("/?url=http://example.com/blog/post/1");
          next();
        },
      );

      router.handle(request, {}, function (err: any) {
        if (err) return done(err);
        expect(request.hit).toEqual(1);
        done();
      });
    });

    it("should ignore FQDN in path", function (done) {
      const request = {
        hit: 0,
        url: "/proxy/http://example.com/blog/post/1",
        method: "GET",
      };
      const router = new Router();

      router.use(
        "/proxy",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(0);
          expect(req.url).toEqual("/http://example.com/blog/post/1");
          next();
        },
      );

      router.handle(request, {}, function (err: any) {
        if (err) return done(err);
        expect(request.hit).toEqual(1);
        done();
      });
    });

    it("should adjust FQDN req.url", function (done) {
      const request = {
        hit: 0,
        url: "http://example.com/blog/post/1",
        method: "GET",
      };
      const router = new Router();

      router.use(
        "/blog",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(0);
          expect(req.url).toEqual("http://example.com/post/1");
          next();
        },
      );

      router.handle(request, {}, function (err: any) {
        if (err) return done(err);
        expect(request.hit).toEqual(1);
        done();
      });
    });

    it("should adjust FQDN req.url with multiple handlers", function (done) {
      const request = {
        hit: 0,
        url: "http://example.com/blog/post/1",
        method: "GET",
      };
      const router = new Router();

      router.use(function (req: Request, res: Response, next: NextFunction) {
        expect((req as any).hit++).toEqual(0);
        expect(req.url).toEqual("http://example.com/blog/post/1");
        next();
      });

      router.use(
        "/blog",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(1);
          expect(req.url).toEqual("http://example.com/post/1");
          next();
        },
      );

      router.handle(request, {}, function (err: any) {
        if (err) return done(err);
        expect(request.hit).toEqual(2);
        done();
      });
    });

    it("should adjust FQDN req.url with multiple routed handlers", function (
      done,
    ) {
      const request = {
        hit: 0,
        url: "http://example.com/blog/post/1",
        method: "GET",
      };
      const router = new Router();

      router.use(
        "/blog",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(0);
          expect(req.url).toEqual("http://example.com/post/1");
          next();
        },
      );

      router.use(
        "/blog",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(1);
          expect(req.url).toEqual("http://example.com/post/1");
          next();
        },
      );

      router.use(
        "/blog",
        function (req: Request, res: Response, next: NextFunction) {
          expect((req as any).hit++).toEqual(2);
          expect(req.url).toEqual("http://example.com/post/1");
          next();
        },
      );

      router.handle(request, {}, function (err: any) {
        if (err) return done(err);
        expect(request.hit).toEqual(3);
        done();
      });
    });
  });

  describe(".all", function () {
    it("should support using .all to capture all http verbs", function (done) {
      const router = new Router();
      let count = 0;

      router.all("/foo", function () {
        count++;
      });

      const url = "/foo?bar=baz";

      methods.forEach(function testMethod(method) {
        router.handle({ url: url, method: method }, {}, function () {});
      });

      expect(count).toEqual(methods.length);
      done();
    });

    it('should be called for any URL when "*"', function (done) {
      const cb = (() => {
        let counter = 0;
        return () => {
          if (counter++ === 3) {
            done();
          }
        };
      })();

      const router = new Router();

      function no() {
        throw new Error("should not be called");
      }

      router.all("*", function (req: Request, res: Response) {
        res.end();
      });

      router.handle({ url: "/", method: "GET" }, { end: cb }, no);
      router.handle({ url: "/foo", method: "GET" }, { end: cb }, no);
      router.handle({ url: "foo", method: "GET" }, { end: cb }, no);
      router.handle({ url: "*", method: "GET" }, { end: cb }, no);
    });
  });

  describe(".use", function () {
    it("should require middleware", function () {
      const router = new Router();
      expect(function () {
        router.use("/");
      }).toThrow(/requires a middleware function/);
    });

    it("should reject string as middleware", function () {
      const router = new Router();
      expect(function () {
        router.use("/", "foo");
      }).toThrow(/requires a middleware function but got a string/);
    });

    it("should reject number as middleware", function () {
      const router = new Router();
      expect(function () {
        router.use("/", 42);
      }).toThrow(/requires a middleware function but got a number/);
    });

    it("should reject null as middleware", function () {
      const router = new Router();
      expect(function () {
        router.use("/", null);
      }).toThrow(/requires a middleware function but got a Null/);
    });

    it("should reject Date as middleware", function () {
      const router = new Router();
      expect(function () {
        router.use("/", new Date());
      }).toThrow(/requires a middleware function but got a Date/);
    });

    it("should be called for any URL", function (done) {
      const cb = (() => {
        let counter = 0;
        return () => {
          if (counter++ === 3) {
            done();
          }
        };
      })();

      const router = new Router();

      function no() {
        throw new Error("should not be called");
      }

      router.use(function (req: Request, res: Response) {
        res.end();
      });

      router.handle({ url: "/", method: "GET" }, { end: cb }, no);
      router.handle({ url: "/foo", method: "GET" }, { end: cb }, no);
      router.handle({ url: "foo", method: "GET" }, { end: cb }, no);
      router.handle({ url: "*", method: "GET" }, { end: cb }, no);
    });

    it("should accept array of middleware", function (done) {
      let count = 0;
      const router = new Router();

      function fn1(req: Request, res: Response, next: NextFunction) {
        expect(++count).toEqual(1);
        next();
      }

      function fn2(req: Request, res: Response, next: NextFunction) {
        expect(++count).toEqual(2);
        next();
      }

      router.use([fn1, fn2], function (req: Request, res: Response) {
        expect(++count).toEqual(3);
        done();
      });

      router.handle({ url: "/foo", method: "GET" }, {}, function () {});
    });
  });

  describe("parallel requests", function () {
    it("should not mix requests", function (done) {
      const req1: any = { url: "/foo/50/bar", method: "get" };
      const req2: any = { url: "/foo/10/bar", method: "get" };
      const router = new Router();
      const sub = new Router();

      const cb = (() => {
        let counter = 0;
        return () => {
          if (counter++ === 1) {
            done();
          }
        };
      })();

      sub.get(
        "/bar",
        function (req: Request, res: Response, next: NextFunction) {
          next();
        },
      );

      router.use(
        "/foo/:ms/",
        function (req: Request, res: Response, next: NextFunction) {
          const ms = parseInt(req.params.ms, 10);
          (req as any).ms = ms;
          setTimeout(next, ms);
        },
      );

      router.use("/foo/:ms/", new Router());
      router.use("/foo/:ms/", sub);

      router.handle(req1, {}, function (err: any) {
        expect(err).toBeUndefined();
        expect(req1.ms).toEqual(50);
        expect(req1.originalUrl).toEqual("/foo/50/bar");
        cb();
      });

      router.handle(req2, {}, function (err: any) {
        expect(err).toBeUndefined();
        expect(req2.ms).toEqual(10);
        expect(req2.originalUrl).toEqual("/foo/10/bar");
        cb();
      });
    });
  });
});
