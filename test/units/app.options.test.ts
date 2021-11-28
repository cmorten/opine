import { opine, Router } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";
import type {
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "../../src/types.ts";

describe("OPTIONS", function () {
  it("should default to the routes defined", function (done) {
    const app = opine();

    app.delete("/", function () {});
    app.get("/users", function (req, res) {});
    app.put("/users", function (req, res) {});

    superdeno(app)
      .options("/users")
      .expect("Allow", "GET,HEAD,PUT")
      .expect(200, "GET,HEAD,PUT", done);
  });

  it("should only include each method once", function (done) {
    const app = opine();

    app.delete("/", function () {});
    app.get("/users", function (req, res) {});
    app.put("/users", function (req, res) {});
    app.get("/users", function (req, res) {});

    superdeno(app)
      .options("/users")
      .expect("Allow", "GET,HEAD,PUT")
      .expect(200, "GET,HEAD,PUT", done);
  });

  it("should not be affected by app.all", function (done) {
    const app = opine();

    app.get("/", function () {});
    app.get("/users", function (req, res) {});
    app.put("/users", function (req, res) {});
    app.all("/users", function (req, res, next) {
      res.set("x-hit", "1");
      next();
    });

    superdeno(app)
      .options("/users")
      .expect("x-hit", "1")
      .expect("Allow", "GET,HEAD,PUT")
      .expect(200, "GET,HEAD,PUT", done);
  });

  it("should not respond if the path is not defined", function (done) {
    const app = opine();

    app.get("/users", function (req, res) {});

    superdeno(app)
      .options("/other")
      .expect(404, done);
  });

  it("should forward requests down the middleware chain", function (done) {
    const app = opine();
    const router = new Router();

    router.get("/users", function (req, res) {});
    app.use(router);
    app.get("/other", function (req, res) {});

    superdeno(app)
      .options("/other")
      .expect("Allow", "GET,HEAD")
      .expect(200, "GET,HEAD", done);
  });

  describe("when error occurs in response handler", function () {
    it("should pass error to callback", function (done) {
      const app = opine();
      const router = Router();

      router.get("/users", function (req, res) {});

      app.use(function (req, res, next) {
        res.setStatus(200);
        next(new Error("test-error"));
      });
      app.use(router);
      app.use(
        function (
          err: any,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          res.end("true");
        },
      );

      superdeno(app)
        .options("/users")
        .expect(200, "true", done);
    });
  });
});

describe("app.options()", function () {
  it("should override the default behavior", function (done) {
    const app = opine();

    app.options("/users", function (req, res) {
      res.set("Allow", "GET");
      res.send("GET");
    });

    app.get("/users", function (req, res) {});
    app.put("/users", function (req, res) {});

    superdeno(app)
      .options("/users")
      .expect("GET")
      .expect("Allow", "GET", done);
  });
});
