import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import type { Server } from "../../deps.ts";
import { describe, it } from "../utils.ts";

function getExpectedClientAddress(server: Server) {
  return (server.addrs[0] as Deno.NetAddr).hostname === "::"
    ? "::ffff:127.0.0.1"
    : "127.0.0.1";
}

describe("req", function () {
  describe(".ip", function () {
    describe("when X-Forwarded-For is present", function () {
      describe('when "trust proxy" is enabled', function () {
        it("should return the client addr", function (done) {
          const app = opine();

          app.enable("trust proxy");

          app.use(function (req, res, _next) {
            res.send(req.ip);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-For", "client, p1, p2")
            .expect("client", done);
        });

        it("should return the addr after trusted proxy", function (done) {
          const app = opine();

          app.set("trust proxy", 2);

          app.use(function (req, res, _next) {
            res.send(req.ip);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-For", "client, p1, p2")
            .expect("p1", done);
        });

        it(
          "should return the addr after trusted proxy, from sub app",
          function (
            done,
          ) {
            const app = opine();
            const sub = opine();

            app.set("trust proxy", 2);
            app.use(sub);

            sub.use(function (req, res, _next) {
              res.send(req.ip);
            });

            superdeno(app)
              .get("/")
              .set("X-Forwarded-For", "client, p1, p2")
              .expect(200, "p1", done);
          },
        );
      });

      describe('when "trust proxy" is disabled', function () {
        it("should return the remote address", function (done) {
          const app = opine();

          app.use(function (req, res, _next) {
            res.send(req.ip);
          });

          const server = app.listen();
          const address = server.addrs[0] as Deno.NetAddr;
          const url = `http://localhost:${address.port}`;

          const test = superdeno(url).get("/");
          test.set("X-Forwarded-For", "client, p1, p2");
          test.expect(200, getExpectedClientAddress(server), () => {
            server.close();
            done();
          });
        });
      });
    });

    describe("when X-Forwarded-For is not present", function () {
      it("should return the remote address", function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.use(function (req, res, _next) {
          res.send(req.ip);
        });

        const server = app.listen();
        const address = server.addrs[0] as Deno.NetAddr;
        const url = `http://localhost:${address.port}`;

        const test = superdeno(url).get("/");
        test.expect(200, getExpectedClientAddress(server), () => {
          server.close();
          done();
        });
      });
    });
  });
});
