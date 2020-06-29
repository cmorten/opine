import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".locals", function () {
    it("should be empty by default", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(res.locals);
      });

      superdeno(app)
        .get("/")
        .expect(200, {}, done);
    });
  });

  it("should work when mounted", function (done) {
    const app = opine();
    const blog = opine();

    app.use(blog);

    blog.use(function (req, res, next) {
      res.locals.foo = "bar";
      next();
    });

    app.use(function (req, res) {
      res.json(res.locals);
    });

    superdeno(app)
      .get("/")
      .expect(200, { foo: "bar" }, done);
  });
});
