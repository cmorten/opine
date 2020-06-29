import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".location(url)", function () {
    it("should set the header", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.location("http://google.com").end();
      });

      superdeno(app)
        .get("/")
        .expect("Location", "http://google.com")
        .expect(200, done);
    });

    it('should encode "url"', function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.location("https://google.com?q=\u2603 §10").end();
      });

      superdeno(app)
        .get("/")
        .expect("Location", "https://google.com?q=%E2%98%83%20%C2%A710")
        .expect(200, done);
    });

    it('should not touch already-encoded sequences in "url"', function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.location("https://google.com?q=%A710").end();
      });

      superdeno(app)
        .get("/")
        .expect("Location", "https://google.com?q=%A710")
        .expect(200, done);
    });

    describe('when url is "back"', function () {
      it('should set location from "Referer" header', function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.location("back").end();
        });

        superdeno(app)
          .get("/")
          .set("Referer", "/some/page.html")
          .expect("Location", "/some/page.html")
          .expect(200, done);
      });

      it('should set location from "Referrer" header', function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.location("back").end();
        });

        superdeno(app)
          .get("/")
          .set("Referrer", "/some/page.html")
          .expect("Location", "/some/page.html")
          .expect(200, done);
      });

      it('should prefer "Referrer" header', function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.location("back").end();
        });

        superdeno(app)
          .get("/")
          .set("Referer", "/some/page1.html")
          .set("Referrer", "/some/page2.html")
          .expect("Location", "/some/page2.html")
          .expect(200, done);
      });

      it('should set the header to "/" without referrer', function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.location("back").end();
        });

        superdeno(app)
          .get("/")
          .expect("Location", "/")
          .expect(200, done);
      });
    });
  });
});
