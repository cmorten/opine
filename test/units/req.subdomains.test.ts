import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".subdomains", function () {
    describe("when present", function () {
      it("should return an array", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send(req.subdomains);
        });

        superdeno(app)
          .get("/")
          .set("Host", "deno.land.example.com")
          .expect(200, ["land", "deno"], done);
      });

      it("should work with IPv4 address", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send(req.subdomains);
        });

        superdeno(app)
          .get("/")
          .set("Host", "127.0.0.1")
          .expect(200, [], done);
      });

      it("should work with IPv6 address", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send(req.subdomains);
        });

        superdeno(app)
          .get("/")
          .set("Host", "[::1]")
          .expect(200, [], done);
      });
    });

    describe("otherwise", function () {
      it("should return an empty array", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send(req.subdomains);
        });

        superdeno(app)
          .get("/")
          .set("Host", "example.com")
          .expect(200, [], done);
      });
    });

    describe("with no host", function () {
      it("should return an empty array", function (done) {
        const app = opine();

        app.use(function (req, res) {
          req.headers.delete("host");
          res.send(req.subdomains);
        });

        superdeno(app)
          .get("/")
          .expect(200, [], done);
      });
    });

    describe("with trusted X-Forwarded-Host", function () {
      it("should return an array", function (done) {
        const app = opine();

        app.set("trust proxy", true);
        app.use(function (req, res) {
          res.send(req.subdomains);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Host", "opine.denoland.example.com")
          .expect(200, ["denoland", "opine"], done);
      });
    });

    describe("when subdomain offset is set", function () {
      describe("when subdomain offset is zero", function () {
        it("should return an array with the whole domain", function (done) {
          const app = opine();
          app.set("subdomain offset", 0);

          app.use(function (req, res) {
            res.send(req.subdomains);
          });

          superdeno(app)
            .get("/")
            .set("Host", "deno.land.sub.example.com")
            .expect(200, ["com", "example", "sub", "land", "deno"], done);
        });

        it("should return an array with the whole IPv4", function (done) {
          const app = opine();
          app.set("subdomain offset", 0);

          app.use(function (req, res) {
            res.send(req.subdomains);
          });

          superdeno(app)
            .get("/")
            .set("Host", "127.0.0.1")
            .expect(200, ["127.0.0.1"], done);
        });

        it("should return an array with the whole IPv6", function (done) {
          const app = opine();
          app.set("subdomain offset", 0);

          app.use(function (req, res) {
            res.send(req.subdomains);
          });

          superdeno(app)
            .get("/")
            .set("Host", "[::1]")
            .expect(200, ["[::1]"], done);
        });
      });

      describe("when present", function () {
        it("should return an array", function (done) {
          const app = opine();
          app.set("subdomain offset", 3);

          app.use(function (req, res) {
            res.send(req.subdomains);
          });

          superdeno(app)
            .get("/")
            .set("Host", "deno.land.sub.example.com")
            .expect(200, ["land", "deno"], done);
        });
      });

      describe("otherwise", function () {
        it("should return an empty array", function (done) {
          const app = opine();
          app.set("subdomain offset", 3);

          app.use(function (req, res) {
            res.send(req.subdomains);
          });

          superdeno(app)
            .get("/")
            .set("Host", "sub.example.com")
            .expect(200, [], done);
        });
      });
    });
  });
});
