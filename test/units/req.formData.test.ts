import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".formData", function () {
    it(
      "should resolve to FormData when the request is a valid `multipart/form-data` request",
      function (done) {
        const app = opine();

        app.use(async function (req, res) {
          const formData = await req.formData();

          res.send(new URLSearchParams(formData as any).toString());
        });

        superdeno(app)
          .post("/")
          .field("type", "text")
          .attach("file", "test/fixtures/name.txt")
          .expect(200, "type=text&file=test%2Ffixtures%2Fname.txt", done);
      },
    );

    it(
      "should resolve the form data if already been parsed",
      function (done) {
        const app = opine();

        app.use(async function (req, res) {
          await req.formData();
          const formData = await req.formData();

          res.send(new URLSearchParams(formData as any).toString());
        });

        superdeno(app)
          .post("/")
          .field("type", "text")
          .attach("file", "test/fixtures/name.txt")
          .expect(200, "type=text&file=test%2Ffixtures%2Fname.txt", done);
      },
    );

    it(
      "should reject when the request is not `multipart/form-data` - GET request",
      function (done) {
        const app = opine();

        app.use(async function (req, res) {
          try {
            await req.formData();

            res.setStatus(500).end();
          } catch (e) {
            expect(e).toEqual(
              new TypeError("Body can not be decoded as form data"),
            );
            res.end();
          }
        });

        superdeno(app)
          .get("/")
          .expect(200, done);
      },
    );

    it(
      "should reject when the request is not `multipart/form-data` - POST `application/json` request",
      function (done) {
        const app = opine();

        app.use(async function (req, res) {
          try {
            await req.formData();

            res.setStatus(500).end();
          } catch (e) {
            expect(e).toEqual(
              new TypeError("Body can not be decoded as form data"),
            );
            res.end();
          }
        });

        superdeno(app)
          .post("/")
          .send({ name: "deno" })
          .expect(200, done);
      },
    );

    it(
      "should reject if the request body has already been consumed and it isn't form data",
      function (done) {
        const app = opine();

        app.use(async function (req, res) {
          try {
            req.body;

            await req.formData();

            res.setStatus(500).end();
          } catch {
            res.end();
          }
        });

        superdeno(app)
          .post("/")
          .send({ name: "deno" })
          .expect(200, done);
      },
    );
  });
});
