import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".links(obj)", function () {
    it("should set Link header field", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.links({
          next: "http://api.example.com/users?page=2",
          last: "http://api.example.com/users?page=5",
        });
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Link",
          '<http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last"',
        )
        .expect(200, done);
    });

    it("should set Link header field for multiple calls", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.links({
          next: "http://api.example.com/users?page=2",
          last: "http://api.example.com/users?page=5",
        });

        res.links({
          prev: "http://api.example.com/users?page=1",
        });

        res.end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Link",
          '<http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last", <http://api.example.com/users?page=1>; rel="prev"',
        )
        .expect(200, done);
    });
  });
});
