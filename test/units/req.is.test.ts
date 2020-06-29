import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req.is()", function () {
  describe("when given a mime type", function () {
    it("should return the type when matching", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("application/json"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, '"application/json"', done);
    });

    it("should return false when not matching", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("image/jpeg"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, "false", done);
    });

    it("should ignore charset", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("application/json"));
      });

      superdeno(app)
        .post("/")
        .type("application/json; charset=UTF-8")
        .send("{}")
        .expect(200, '"application/json"', done);
    });
  });

  describe("when content-type is not present", function () {
    it("should return false", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("application/json"));
      });

      superdeno(app).post("/").send("{}").expect(200, "false", done);
    });
  });

  describe("when given an extension", function () {
    it("should lookup the mime type", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("json"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, '"json"', done);
    });
  });

  describe("when given */subtype", function () {
    it("should return the full type when matching", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("*/json"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, '"application/json"', done);
    });

    it("should return false when not matching", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("*/html"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, "false", done);
    });

    it("should ignore charset", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("*/json"));
      });

      superdeno(app)
        .post("/")
        .type("application/json; charset=UTF-8")
        .send("{}")
        .expect(200, '"application/json"', done);
    });
  });

  describe("when given type/*", function () {
    it("should return the full type when matching", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("application/*"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, '"application/json"', done);
    });

    it("should return false when not matching", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("text/*"));
      });

      superdeno(app)
        .post("/")
        .type("application/json")
        .send("{}")
        .expect(200, "false", done);
    });

    it("should ignore charset", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.is("application/*"));
      });

      superdeno(app)
        .post("/")
        .type("application/json; charset=UTF-8")
        .send("{}")
        .expect(200, '"application/json"', done);
    });
  });
});
