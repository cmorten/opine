import { opine, Router } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { after, describe, it } from "../utils.ts";
import type {
  NextFunction,
  Opine,
  OpineRequest,
  OpineResponse,
} from "../../src/types.ts";

const app1 = opine();

app1.use(function (req, res, next) {
  res.format({
    "text/plain": function () {
      res.send("hey");
    },

    "text/html": function () {
      res.send("<p>hey</p>");
    },

    "application/json": function (a: any, b: any, c: any) {
      expect(req).toEqual(a);
      expect(res).toEqual(b);
      expect(next).toEqual(c);
      res.send({ message: "hey" });
    },
  });
});

app1.use(
  function (
    err: any,
    req: OpineRequest,
    res: OpineResponse,
    next: NextFunction,
  ) {
    if (!err.types) {
      throw err;
    }

    res.setStatus(err.status).send("Supports: " + err.types.join(", "));
  },
);

const app2 = opine();

app2.use(function (req, res, next) {
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
});

app2.use(
  function (
    err: any,
    req: OpineRequest,
    res: OpineResponse,
    next: NextFunction,
  ) {
    res.setStatus(err.status).send("Supports: " + err.types.join(", "));
  },
);

const app3 = opine();

app3.use(function (req, res, next) {
  res.format({
    text: function () {
      res.send("hey");
    },
    default: function () {
      res.send("default");
    },
  });
});

const app4 = opine();

app4.get("/", function (req, res, next) {
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
});

app4.use(
  function (
    err: any,
    req: OpineRequest,
    res: OpineResponse,
    next: NextFunction,
  ) {
    res.setStatus(err.status).send("Supports: " + err.types.join(", "));
  },
);

const app5 = opine();

app5.use(function (req, res, next) {
  res.format({
    default: function () {
      res.send("hey");
    },
  });
});

describe("res", function () {
  describe(".format(obj)", function () {
    describe("with canonicalized mime types", function () {
      test(app1);
    });

    describe("with extnames", function () {
      test(app2);
    });

    describe("with parameters", function () {
      const app = opine();

      app.use(function (req, res, next) {
        res.format({
          "text/plain; charset=utf-8": function () {
            res.send("hey");
          },
          "text/html; foo=bar; bar=baz": function () {
            res.send("<p>hey</p>");
          },
          "application/json; q=0.5": function () {
            res.send({ message: "hey" });
          },
        });
      });

      app.use(
        function (
          err: any,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          res.setStatus(err.status).send("Supports: " + err.types.join(", "));
        },
      );

      test(app);
    });

    describe("given .default", function () {
      it("should be invoked instead of auto-responding", function (done) {
        superdeno(app3)
          .get("/")
          .set("Accept", "text/html")
          .expect("default", done);
      });

      it("should work when only .default is provided", function (done) {
        superdeno(app5)
          .get("/")
          .set("Accept", "*/*")
          .expect("hey", done);
      });
    });

    describe("in router", function () {
      test(app4);
    });

    describe("in router", function () {
      const app = opine();
      const router = Router();

      router.get("/", function (req, res, next) {
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
      });

      router.use(
        function (
          err: any,
          req: OpineRequest,
          res: OpineResponse,
          next: NextFunction,
        ) {
          res.setStatus(err.status).send("Supports: " + err.types.join(", "));
        },
      );

      app.use(router);

      test(app);
    });
  });
});

function test(app: Opine) {
  it("should utilize q values in negotiation", function (done) {
    superdeno(app)
      .get("/")
      .set("Accept", "text/html; q=.5, application/json, */*; q=.1")
      .expect({ "message": "hey" }, done);
  });

  it("should allow wildcard type/subtypes", function (done) {
    superdeno(app)
      .get("/")
      .set("Accept", "text/html; q=.5, application/*, */*; q=.1")
      .expect({ "message": "hey" }, done);
  });

  it("should default the Content-Type", function (done) {
    superdeno(app)
      .get("/")
      .set("Accept", "text/html; q=.5, text/plain")
      .expect("Content-Type", "text/plain; charset=utf-8")
      .expect("hey", done);
  });

  it("should set the correct charset for the Content-Type", function (done) {
    const cb = after(3, done);

    superdeno(app)
      .get("/")
      .set("Accept", "text/html")
      .expect("Content-Type", "text/html; charset=utf-8", cb);

    superdeno(app)
      .get("/")
      .set("Accept", "text/plain")
      .expect("Content-Type", "text/plain; charset=utf-8", cb);

    superdeno(app)
      .get("/")
      .set("Accept", "application/json")
      .expect("Content-Type", "application/json; charset=utf-8", cb);
  });

  it("should vary: Accept", function (done) {
    superdeno(app)
      .get("/")
      .set("Accept", "text/html; q=.5, text/plain")
      .expect("vary", /Accept/, done);
  });

  describe("when Accept is not present", function () {
    it("should invoke the first callback", function (done) {
      superdeno(app)
        .get("/")
        .expect("hey", done);
    });
  });

  describe("when no match is made", function () {
    it("should should respond with 406 not acceptable", function (done) {
      superdeno(app)
        .get("/")
        .set("Accept", "foo/bar")
        .expect("Supports: text/plain, text/html, application/json")
        .expect(406, done);
    });
  });
}
