import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

// Custom Host headers removed in Deno 1.12.0 meaning the majority
// of these tests cannot be used.
//
// REF: https://github.com/denoland/deno/issues/11017

describe("req", function () {
  describe(".hostname", function () {
    it("should return the Host", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.end(req.hostname);
      });

      superdeno(app)
        .post("/")
        .expect("127.0.0.1", done);
    });

    // it("should return the Host when present", function (done) {
    //   const app = opine();

    //   app.use(function (req, res) {
    //     res.end(req.hostname);
    //   });

    //   superdeno(app)
    //     .post("/")
    //     .set("Host", "example.com")
    //     .expect("example.com", done);
    // });

    // it("should strip port number", function (done) {
    //   const app = opine();

    //   app.use(function (req, res) {
    //     res.end(req.hostname);
    //   });

    //   superdeno(app)
    //     .post("/")
    //     .set("Host", "example.com:3000")
    //     .expect("example.com", done);
    // });

    it("should return undefined otherwise", function (done) {
      const app = opine();

      app.use(function (req, res) {
        req.headers.delete("host");
        res.end(String(req.hostname));
      });

      superdeno(app)
        .post("/")
        .expect("undefined", done);
    });

    // it("should work with IPv6 Host", function (done) {
    //   const app = opine();

    //   app.use(function (req, res) {
    //     res.end(req.hostname);
    //   });

    //   superdeno(app)
    //     .post("/")
    //     .set("Host", "[::1]")
    //     .expect("[::1]", done);
    // });

    // it("should work with IPv6 Host and port", function (done) {
    //   const app = opine();

    //   app.use(function (req, res) {
    //     res.end(req.hostname);
    //   });

    //   superdeno(app)
    //     .post("/")
    //     .set("Host", "[::1]:3000")
    //     .expect("[::1]", done);
    // });

    describe('when "trust proxy" is enabled', function () {
      it("should respect X-Forwarded-Host", function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.use(function (req, res) {
          res.end(req.hostname);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Host", "example.com:3000")
          .expect("example.com", done);
      });

      it("should ignore X-Forwarded-Host if socket addr not trusted", function (
        done,
      ) {
        const app = opine();

        app.set("trust proxy", "10.0.0.1");

        app.use(function (req, res) {
          res.end(req.hostname);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Host", "example.com")
          .expect("127.0.0.1", done);
      });

      // it("should default to Host", function (done) {
      //   const app = opine();

      //   app.enable("trust proxy");

      //   app.use(function (req, res) {
      //     res.end(req.hostname);
      //   });

      //   superdeno(app)
      //     .get("/")
      //     .set("Host", "example.com")
      //     .expect("example.com", done);
      // });

      describe("when multiple X-Forwarded-Host", function () {
        it("should use the first value", function (done) {
          const app = opine();

          app.enable("trust proxy");

          app.use(function (req, res) {
            res.send(req.hostname);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-Host", "example.com, foobar.com")
            .expect(200, "example.com", done);
        });

        it("should remove OWS around comma", function (done) {
          const app = opine();

          app.enable("trust proxy");

          app.use(function (req, res) {
            res.send(req.hostname);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-Host", "example.com , foobar.com")
            .expect(200, "example.com", done);
        });

        it("should strip port number", function (done) {
          const app = opine();

          app.enable("trust proxy");

          app.use(function (req, res) {
            res.send(req.hostname);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-Host", "example.com:8080 , foobar.com:8888")
            .expect(200, "example.com", done);
        });
      });
    });

    describe('when "trust proxy" is disabled', function () {
      it("should ignore X-Forwarded-Host", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.end(req.hostname);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Host", "evil")
          .expect("127.0.0.1", done);
      });
    });
  });
});
