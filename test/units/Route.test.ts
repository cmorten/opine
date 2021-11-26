import { Route } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";
import type {
  IRoute,
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "../../src/types.ts";
import { methods } from "../../src/methods.ts";

describe("Route", function () {
  it("should work without handlers", function (done) {
    const req = { method: "GET", url: "/" };
    const route = new Route("/foo");
    route.dispatch(req, {}, done);
  });

  describe(".all", function () {
    it("should add handler", function (done) {
      const req: any = { method: "GET", url: "/" };
      const route: IRoute = new Route("/foo");

      route.all(function (req, res, next) {
        (req as any).called = true;
        next();
      });

      route.dispatch(req, {} as any, function (err: any) {
        if (err) return done(err);
        expect(req.called).toBeTruthy();
        done();
      });
    });

    it("should handle VERBS", function (done) {
      let count = 0;
      const route: IRoute = new Route("/foo");

      const cb = function (err: any) {
        if (count < methods.length) return;
        if (err) return done(err);
        expect(count).toEqual(methods.length);
        done();
      };

      route.all(function (req, res, next) {
        count++;
        next();
      });

      methods.forEach(function testMethod(method) {
        const req: any = { method: method, url: "/" };
        route.dispatch(req, {} as any, cb);
      });
    });

    it("should stack", function (done) {
      const req: any = { count: 0, method: "GET", url: "/" };
      const route: IRoute = new Route("/foo");

      route.all(function (req, res, next) {
        (req as any).count++;
        next();
      });

      route.all(function (req, res, next) {
        (req as any).count++;
        next();
      });

      route.dispatch(req, {} as any, function (err: any) {
        if (err) return done(err);
        expect(req.count).toEqual(2);
        done();
      });
    });
  });

  describe(".VERB", function () {
    it("should support .get", function (done) {
      const req: any = { method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.get(function (req, res, next) {
        (req as any).called = true;
        next();
      });

      route.dispatch(req, {} as any, function (err: any) {
        if (err) return done(err);
        expect(req.called).toBeTruthy();
        done();
      });
    });

    it("should limit to just .VERB", function (done) {
      const req: any = { method: "POST", url: "/" };
      const route: IRoute = new Route("");

      route.get(function (req, res, next) {
        throw new Error("not me!");
      });

      route.post(function (req, res, next) {
        (req as any).called = true;
        next();
      });

      route.dispatch(req, {} as any, function (err: any) {
        if (err) return done(err);
        expect(req.called).toBeTruthy();
        done();
      });
    });

    it("should allow fallthrough", function (done) {
      const req: any = { order: "", method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.get(function (req, res, next) {
        (req as any).order += "a";
        next();
      });

      route.all(function (req, res, next) {
        (req as any).order += "b";
        next();
      });

      route.get(function (req, res, next) {
        (req as any).order += "c";
        next();
      });

      route.dispatch(req, {} as any, function (err: any) {
        if (err) return done(err);
        expect(req.order).toEqual("abc");
        done();
      });
    });
  });

  describe("errors", function () {
    it("should handle errors via arity 4 functions", function (done) {
      const req: any = { order: "", method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.all(function (req, res, next) {
        next(new Error("foobar"));
      });

      route.all(function (req, res, next) {
        (req as any).order += "0";
        next();
      });

      route.all(
        function (
          err: Error,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          (req as any).order += "a";
          next(err);
        },
      );

      route.dispatch(req, {} as any, function (err: any) {
        expect(err).toBeDefined();
        expect(err.message).toEqual("foobar");
        expect(req.order).toEqual("a");
        done();
      });
    });

    it("should handle throw", function (done) {
      const req: any = { order: "", method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.all(function (req, res, next) {
        throw new Error("foobar");
      });

      route.all(function (req, res, next) {
        (req as any).order += "0";
        next();
      });

      route.all(
        function (
          err: Error,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          (req as any).order += "a";
          next(err);
        },
      );

      route.dispatch(req, {} as any, function (err: any) {
        expect(err).toBeDefined();
        expect(err.message).toEqual("foobar");
        expect(req.order).toEqual("a");
        done();
      });
    });

    it("should handle throwing inside error handlers", function (done) {
      const req: any = { method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.get(function (req, res, next) {
        throw new Error("boom!");
      });

      route.get(
        function (
          err: Error,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          throw new Error("oops");
        },
      );

      route.get(
        function (
          err: Error,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          (req as any).message = err.message;
          next();
        },
      );

      route.dispatch(req, {} as any, function (err: any) {
        if (err) return done(err);
        expect(req.message).toEqual("oops");
        done();
      });
    });

    it("should handle throw in .all", function (done) {
      const req: any = { method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.all(function (req, res, next) {
        throw new Error("boom!");
      });

      route.dispatch(req, {} as any, function (err: any) {
        expect(err).toBeDefined();
        expect(err.message).toEqual("boom!");
        done();
      });
    });

    it("should handle single error handler", function (done) {
      const req: any = { method: "GET", url: "/" };
      const route: IRoute = new Route("");

      route.all(
        function (
          err: Error,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          // this should not execute
          done(new Error("'route.all' should not have been executed"));
        },
      );

      route.dispatch(req, {} as any, done);
    });
  });
});
