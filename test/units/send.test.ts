import { opine } from "../../mod.ts";
import type { OpineRequest, OpineResponse } from "../../mod.ts";
import { send } from "../../src/utils/send.ts";
import {
  describe,
  it,
  shouldNotHaveBody,
  shouldNotHaveHeader,
} from "../utils.ts";
import { superdeno } from "../deps.ts";
import { dirname, fromFileUrl, join, STATUS_TEXT } from "../../deps.ts";

const __dirname = dirname(import.meta.url);
const fixtures = fromFileUrl(join(__dirname, "../fixtures"));

const dateRegExp = /^\w{3}, \d+ \w+ \d+ \d+:\d+:\d+ \w+$/;

const app = opine();

app.use(async (req, res) => {
  try {
    await send(req, res, req.url, { root: fixtures });
  } catch (err) {
    res.status = err.status ?? 500;
    await res.end(STATUS_TEXT.get(err.status));
  }
});

function createServer(
  opts: Record<string, unknown>,
  fn?: (req: OpineRequest, res: OpineResponse) => void,
) {
  const server = opine();

  server.use(async (req, res) => {
    try {
      fn && await fn(req, res);

      await send(req, res, req.url, opts);
    } catch (err) {
      res.status = err.status ?? 500;
      await res.end(String(err));
    }
  });

  return server;
}

describe("send(file)", function () {
  it("should stream the file contents", function (done) {
    superdeno(app)
      .get("/name.txt")
      .expect("Content-Length", "4")
      .expect(200, "deno", done);
  });

  it("should stream a zero-length file", function (done) {
    superdeno(app)
      .get("/empty.txt")
      .expect("Content-Length", "0")
      .expect(200, "", done);
  });

  it("should decode the given path as a URI", function (done) {
    superdeno(app)
      .get("/some%20thing.txt")
      .expect(200, "hey", done);
  });

  it("should serve files with dots in name", function (done) {
    superdeno(app)
      .get("/do..ts.txt")
      .expect(200, "...", done);
  });

  it("should treat a malformed URI as a bad request", function (done) {
    superdeno(app)
      .get("/some%99thing.txt")
      .expect(400, "Bad Request", done);
  });

  it("should 400 on NULL bytes", function (done) {
    superdeno(app)
      .get("/some%00thing.txt")
      .expect(400, "Bad Request", done);
  });

  it("should treat an ENAMETOOLONG as a 404", function (done) {
    const path = Array(100).join("foobar");

    superdeno(app)
      .get("/" + path)
      .expect(404)
      .end((err) => {
        console.log(err);
        done(err);
      });
  });

  it("should support HEAD", function (done) {
    superdeno(app)
      .head("/name.txt")
      .expect(200)
      .expect("Content-Length", "4")
      .expect(shouldNotHaveBody())
      .end(done);
  });

  it("should add an ETag header field", function (done) {
    superdeno(app)
      .get("/name.txt")
      .expect("etag", /^W\/"[^"]+"$/)
      .end(done);
  });

  it("should add a Date header field", function (done) {
    superdeno(app)
      .get("/name.txt")
      .expect("date", dateRegExp, done);
  });

  it("should add a Last-Modified header field", function (done) {
    superdeno(app)
      .get("/name.txt")
      .expect("last-modified", dateRegExp, done);
  });

  it("should add a Accept-Ranges header field", function (done) {
    superdeno(app)
      .get("/name.txt")
      .expect("Accept-Ranges", "bytes", done);
  });

  it("should 404 if the file does not exist", function (done) {
    superdeno(app)
      .get("/meow")
      .expect(404, "Not Found", done);
  });

  it("should set Content-Type via mime map", function (done) {
    superdeno(app)
      .get("/name.txt")
      .expect("Content-Type", "text/plain; charset=utf-8")
      .expect(200, function (err) {
        if (err) return done(err);

        superdeno(app)
          .get("/deno.html")
          .expect("Content-Type", "text/html; charset=utf-8")
          .expect(200, done);
      });
  });

  describe('when no "directory" listeners are present', function () {
    it("should redirect directories to trailing slash", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/pets")
        .expect("Location", "/pets/")
        .expect(301, done);
    });

    it("should respond with an HTML redirect", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/pets")
        .accept("html")
        .expect("Location", "/pets/")
        .expect("Content-Type", /html/)
        .expect(301, /Redirecting to <a href="\/pets\/">\/pets\/<\/a>/, done);
    });

    it("should respond with default Content-Security-Policy", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/pets")
        .expect("Location", "/pets/")
        .expect("Content-Security-Policy", "default-src 'none'")
        .expect(301, done);
    });

    it("should not redirect to protocol-relative locations", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("//pets")
        .expect("Location", "/pets/")
        .expect(301, done);
    });
  });

  describe("with conditional-GET", function () {
    it("should remove Content headers with 304", function (done) {
      const server = createServer({ root: fixtures }, function (_req, res) {
        res.setHeader("Content-Language", "en-US");
        res.setHeader("Content-Location", "http://localhost/name.txt");
        res.setHeader("Contents", "foo");
      });

      superdeno(server)
        .get("/name.txt")
        .expect(200, function (err, res) {
          if (err) return done(err);

          superdeno(server)
            .get("/name.txt")
            .set("If-None-Match", res.headers.etag as string)
            .expect(shouldNotHaveHeader("Content-Language"))
            .expect(shouldNotHaveHeader("Content-Length"))
            .expect(shouldNotHaveHeader("Content-Type"))
            .expect("Content-Location", "http://localhost/name.txt")
            .expect("Contents", "foo")
            .expect(304, done);
        });
    });

    describe('where "If-Match" is set', function () {
      it('should respond with 200 when "*"', function (done) {
        superdeno(app)
          .get("/name.txt")
          .set("If-Match", "*")
          .expect(200, done);
      });

      it("should respond with 412 when ETag unmatched", function (done) {
        superdeno(app)
          .get("/name.txt")
          .set("If-Match", ' "foo",, "bar" ,')
          .expect(412, done);
      });

      it("should respond with 200 when ETag matched", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);
            superdeno(app)
              .get("/name.txt")
              .set("If-Match", '"foo", "bar", ' + res.headers.etag)
              .expect(200, done);
          });
      });
    });

    describe('where "If-Modified-Since" is set', function () {
      it("should respond with 304 when unmodified", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            superdeno(app)
              .get("/name.txt")
              .set("If-Modified-Since", res.headers["last-modified"] as string)
              .expect(304, done);
          });
      });

      it("should respond with 200 when modified", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            const lmod = new Date(res.headers["last-modified"] as string);
            const date = new Date(+lmod - 60000);

            superdeno(app)
              .get("/name.txt")
              .set("If-Modified-Since", date.toUTCString())
              .expect(200, "deno", done);
          });
      });
    });

    describe('where "If-None-Match" is set', function () {
      it("should respond with 304 when ETag matched", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            superdeno(app)
              .get("/name.txt")
              .set("If-None-Match", res.headers.etag as string)
              .expect(304, done);
          });
      });

      it("should respond with 200 when ETag unmatched", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, _res) {
            if (err) return done(err);

            superdeno(app)
              .get("/name.txt")
              .set("If-None-Match", '"123"')
              .expect(200, "deno", done);
          });
      });
    });

    describe('where "If-Unmodified-Since" is set', function () {
      it("should respond with 200 when unmodified", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            superdeno(app)
              .get("/name.txt")
              .set(
                "If-Unmodified-Since",
                res.headers["last-modified"] as string,
              )
              .expect(200, done);
          });
      });

      it("should respond with 412 when modified", function (done) {
        superdeno(app)
          .get("/name.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            const lmod = new Date(res.headers["last-modified"] as string);
            const date = new Date(+lmod - 60000).toUTCString();

            superdeno(app)
              .get("/name.txt")
              .set("If-Unmodified-Since", date)
              .expect(412, done);
          });
      });

      it("should respond with 200 when invalid date", function (done) {
        superdeno(app)
          .get("/name.txt")
          .set("If-Unmodified-Since", "foo")
          .expect(200, done);
      });
    });
  });

  describe("with Range request", function () {
    it("should support byte ranges", function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "bytes=0-4")
        .expect(206, "12345", done);
    });

    it("should ignore non-byte ranges", function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "items=0-4")
        .expect(200, "123456789", done);
    });

    it("should be inclusive", function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "bytes=0-0")
        .expect(206, "1", done);
    });

    it("should set Content-Range", function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "bytes=2-5")
        .expect("Content-Range", "bytes 2-5/9")
        .expect(206, done);
    });

    it("should support -n", function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "bytes=-3")
        .expect(206, "789", done);
    });

    it("should support n-", function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "bytes=3-")
        .expect(206, "456789", done);
    });

    it('should respond with 206 "Partial Content"', function (done) {
      superdeno(app)
        .get("/nums.txt")
        .set("Range", "bytes=0-4")
        .expect(206, done);
    });

    it(
      "should set Content-Length to the # of octets transferred",
      function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("Range", "bytes=2-3")
          .expect("Content-Length", "2")
          .expect(206, "34", done);
      },
    );

    describe("when last-byte-pos of the range is greater the length", function () {
      it("is taken to be equal to one less than the length", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("Range", "bytes=2-50")
          .expect("Content-Range", "bytes 2-8/9")
          .expect(206, done);
      });

      it("should adapt the Content-Length accordingly", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("Range", "bytes=2-50")
          .expect("Content-Length", "7")
          .expect(206, done);
      });
    });

    describe("when the first-byte-pos of the range is greater length", function () {
      it("should respond with 416", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("Range", "bytes=9-50")
          .expect("Content-Range", "bytes */9")
          .expect(416, done);
      });
    });

    describe("when syntactically invalid", function () {
      it("should respond with 200 and the entire contents", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("Range", "asdf")
          .expect(200, "123456789", done);
      });
    });

    describe("when multiple ranges", function () {
      it("should respond with 200 and the entire contents", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("Range", "bytes=1-1,3-")
          .expect(shouldNotHaveHeader("Content-Range"))
          .expect(200, "123456789", done);
      });

      it(
        "should respond with 206 is all ranges can be combined",
        function (done) {
          superdeno(app)
            .get("/nums.txt")
            .set("Range", "bytes=1-2,3-5")
            .expect("Content-Range", "bytes 1-5/9")
            .expect(206, "23456", done);
        },
      );
    });

    describe("when if-range present", function () {
      it("should respond with parts when etag unchanged", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            const etag = res.headers.etag as string;

            superdeno(app)
              .get("/nums.txt")
              .set("If-Range", etag)
              .set("Range", "bytes=0-0")
              .expect(206, "1", done);
          });
      });

      it("should respond with 200 when etag changed", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            const etag = (res.headers.etag as string).replace(/"(.)/, '"0$1');

            superdeno(app)
              .get("/nums.txt")
              .set("If-Range", etag)
              .set("Range", "bytes=0-0")
              .expect(200, "123456789", done);
          });
      });

      it("should respond with parts when modified unchanged", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            const modified = res.headers["last-modified"] as string;

            superdeno(app)
              .get("/nums.txt")
              .set("If-Range", modified)
              .set("Range", "bytes=0-0")
              .expect(206, "1", done);
          });
      });

      it("should respond with 200 when modified changed", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .expect(200, function (err, res) {
            if (err) return done(err);

            const modified =
              Date.parse(res.headers["last-modified"] as string) - 20000;

            superdeno(app)
              .get("/nums.txt")
              .set("If-Range", new Date(modified).toUTCString())
              .set("Range", "bytes=0-0")
              .expect(200, "123456789", done);
          });
      });

      it("should respond with 200 when invalid value", function (done) {
        superdeno(app)
          .get("/nums.txt")
          .set("If-Range", "foo")
          .set("Range", "bytes=0-0")
          .expect(200, "123456789", done);
      });
    });
  });

  describe('when "options" is specified', function () {
    it("should support start/end", function (done) {
      superdeno(createServer({ root: fixtures, start: 3, end: 5 }))
        .get("/nums.txt")
        .expect(200, "456", done);
    });

    it("should adjust too large end", function (done) {
      superdeno(createServer({ root: fixtures, start: 3, end: 90 }))
        .get("/nums.txt")
        .expect(200, "456789", done);
    });

    it("should support start/end with Range request", function (done) {
      superdeno(createServer({ root: fixtures, start: 0, end: 2 }))
        .get("/nums.txt")
        .set("Range", "bytes=-2")
        .expect(206, "23", done);
    });

    it(
      "should support start/end with unsatisfiable Range request",
      function (done) {
        superdeno(createServer({ root: fixtures, start: 0, end: 2 }))
          .get("/nums.txt")
          .set("Range", "bytes=5-9")
          .expect("Content-Range", "bytes */3")
          .expect(416, done);
      },
    );
  });
});

describe("send(file, options)", function () {
  describe("acceptRanges", function () {
    it("should support disabling accept-ranges", function (done) {
      superdeno(createServer({ acceptRanges: false, root: fixtures }))
        .get("/nums.txt")
        .expect(shouldNotHaveHeader("Accept-Ranges"))
        .expect(200, done);
    });

    it("should ignore requested range", function (done) {
      superdeno(createServer({ acceptRanges: false, root: fixtures }))
        .get("/nums.txt")
        .set("Range", "bytes=0-2")
        .expect(shouldNotHaveHeader("Accept-Ranges"))
        .expect(shouldNotHaveHeader("Content-Range"))
        .expect(200, "123456789", done);
    });
  });

  describe("cacheControl", function () {
    it("should support disabling cache-control", function (done) {
      superdeno(createServer({ cacheControl: false, root: fixtures }))
        .get("/name.txt")
        .expect(shouldNotHaveHeader("Cache-Control"))
        .expect(200, done);
    });

    it("should ignore maxAge option", function (done) {
      superdeno(
        createServer({ cacheControl: false, maxAge: 1000, root: fixtures }),
      )
        .get("/name.txt")
        .expect(shouldNotHaveHeader("Cache-Control"))
        .expect(200, done);
    });
  });

  describe("etag", function () {
    it("should support disabling etags", function (done) {
      superdeno(createServer({ etag: false, root: fixtures }))
        .get("/name.txt")
        .expect(shouldNotHaveHeader("ETag"))
        .expect(200, done);
    });
  });

  describe("extensions", function () {
    it("should reject numbers", function (done) {
      superdeno(createServer({ extensions: 42, root: fixtures }))
        .get("/pets/index")
        .expect(500, /TypeError: extensions option/, done);
    });

    it("should reject true", function (done) {
      superdeno(createServer({ extensions: true, root: fixtures }))
        .get("/pets/index")
        .expect(500, /TypeError: extensions option/, done);
    });

    it("should be not be enabled by default", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/deno")
        .expect(404, done);
    });

    it("should be configurable", function (done) {
      superdeno(createServer({ extensions: "txt", root: fixtures }))
        .get("/name")
        .expect(200, "deno", done);
    });

    it("should support disabling extensions", function (done) {
      superdeno(createServer({ extensions: false, root: fixtures }))
        .get("/name")
        .expect(404, done);
    });

    it("should support fallbacks", function (done) {
      superdeno(
        createServer({ extensions: ["htm", "html", "txt"], root: fixtures }),
      )
        .get("/name")
        .expect(200, "<p>deno</p>", done);
    });

    it("should 404 if nothing found", function (done) {
      superdeno(
        createServer({ extensions: ["htm", "html", "txt"], root: fixtures }),
      )
        .get("/bob")
        .expect(404, done);
    });

    it("should skip directories", function (done) {
      superdeno(createServer({ extensions: ["file", "dir"], root: fixtures }))
        .get("/name")
        .expect(404, done);
    });

    it("should not search if file has extension", function (done) {
      superdeno(createServer({ extensions: "html", root: fixtures }))
        .get("/thing.html")
        .expect(404, done);
    });
  });

  describe("lastModified", function () {
    it("should support disabling last-modified", function (done) {
      superdeno(createServer({ lastModified: false, root: fixtures }))
        .get("/name.txt")
        .expect(shouldNotHaveHeader("Last-Modified"))
        .expect(200, done);
    });
  });

  describe("dotfiles", function () {
    it('should default to "ignore"', function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/.hidden.txt")
        .expect(404, done);
    });

    it("should reject bad value", function (done) {
      superdeno(createServer({ dotfiles: "bogus" }))
        .get("/.hidden.txt")
        .expect(500, /dotfiles/, done);
    });

    describe('when "allow"', function () {
      it("should send dotfile", function (done) {
        superdeno(createServer({ dotfiles: "allow", root: fixtures }))
          .get("/.hidden.txt")
          .expect(200, "secret", done);
      });

      it("should send within dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "allow", root: fixtures }))
          .get("/.mine/name.txt")
          .expect(200, /deno/, done);
      });

      it("should 404 for non-existent dotfile", function (done) {
        superdeno(createServer({ dotfiles: "allow", root: fixtures }))
          .get("/.nothere")
          .expect(404, done);
      });
    });

    describe('when "deny"', function () {
      it("should 403 for dotfile", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/.hidden.txt")
          .expect(403, done);
      });

      it("should 403 for dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/.mine")
          .expect(403, done);
      });

      it(
        "should 403 for dotfile directory with trailing slash",
        function (done) {
          superdeno(createServer({ dotfiles: "deny", root: fixtures }))
            .get("/.mine/")
            .expect(403, done);
        },
      );

      it("should 403 for file within dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/.mine/name.txt")
          .expect(403, done);
      });

      it("should 403 for non-existent dotfile", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/.nothere")
          .expect(403, done);
      });

      it("should 403 for non-existent dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/.what/name.txt")
          .expect(403, done);
      });

      it("should 403 for dotfile in directory", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/pets/.hidden")
          .expect(403, done);
      });

      it("should 403 for dotfile in dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "deny", root: fixtures }))
          .get("/.mine/.hidden")
          .expect(403, done);
      });

      it("should send files in root dotfile directory", function (done) {
        superdeno(
          createServer({
            dotfiles: "deny",
            root: join(fixtures, ".mine"),
          }),
        )
          .get("/name.txt")
          .expect(200, /deno/, done);
      });
    });

    describe('when "ignore"', function () {
      it("should 404 for dotfile", function (done) {
        superdeno(createServer({ dotfiles: "ignore", root: fixtures }))
          .get("/.hidden.txt")
          .expect(404, done);
      });

      it("should 404 for dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "ignore", root: fixtures }))
          .get("/.mine")
          .expect(404, done);
      });

      it(
        "should 404 for dotfile directory with trailing slash",
        function (done) {
          superdeno(createServer({ dotfiles: "ignore", root: fixtures }))
            .get("/.mine/")
            .expect(404, done);
        },
      );

      it("should 404 for file within dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "ignore", root: fixtures }))
          .get("/.mine/name.txt")
          .expect(404, done);
      });

      it("should 404 for non-existent dotfile", function (done) {
        superdeno(createServer({ dotfiles: "ignore", root: fixtures }))
          .get("/.nothere")
          .expect(404, done);
      });

      it("should 404 for non-existent dotfile directory", function (done) {
        superdeno(createServer({ dotfiles: "ignore", root: fixtures }))
          .get("/.what/name.txt")
          .expect(404, done);
      });

      it("should send files in root dotfile directory", function (done) {
        superdeno(
          createServer({
            dotfiles: "ignore",
            root: join(fixtures, ".mine"),
          }),
        )
          .get("/name.txt")
          .expect(200, /deno/, done);
      });
    });
  });

  describe("immutable", function () {
    it("should default to false", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/name.txt")
        .expect("Cache-Control", "public, max-age=0", done);
    });

    it("should set immutable directive in Cache-Control", function (done) {
      superdeno(createServer({ immutable: true, maxAge: "1h", root: fixtures }))
        .get("/name.txt")
        .expect("Cache-Control", "public, max-age=3600, immutable", done);
    });
  });

  describe("maxAge", function () {
    it("should default to 0", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/name.txt")
        .expect("Cache-Control", "public, max-age=0", done);
    });

    it("should floor to integer", function (done) {
      superdeno(createServer({ maxAge: 123956, root: fixtures }))
        .get("/name.txt")
        .expect("Cache-Control", "public, max-age=123", done);
    });

    it("should accept string", function (done) {
      superdeno(createServer({ maxAge: "30d", root: fixtures }))
        .get("/name.txt")
        .expect("Cache-Control", "public, max-age=2592000", done);
    });

    it("should max at 1 year", function (done) {
      superdeno(createServer({ maxAge: "2y", root: fixtures }))
        .get("/name.txt")
        .expect("Cache-Control", "public, max-age=31536000", done);
    });
  });

  describe("index", function () {
    it("should reject numbers", function (done) {
      superdeno(createServer({ root: fixtures, index: 42 }))
        .get("/pets/index")
        .expect(500, /TypeError: index option/, done);
    });

    it("should reject true", function (done) {
      superdeno(createServer({ root: fixtures, index: true }))
        .get("/pets/")
        .expect(500, /TypeError: index option/, done);
    });

    it("should default to index.html", function (done) {
      superdeno(createServer({ root: fixtures }))
        .get("/pets/")
        .expect(
          Deno.readTextFileSync(join(fixtures, "pets", "index.html")),
          done,
        );
    });

    it("should be configurable", function (done) {
      superdeno(createServer({ root: fixtures, index: "deno.html" }))
        .get("/")
        .expect(200, "<p>deno</p>", done);
    });

    it("should support disabling", function (done) {
      superdeno(createServer({ root: fixtures, index: false }))
        .get("/pets/")
        .expect(403, done);
    });

    it("should support fallbacks", function (done) {
      superdeno(
        createServer({ root: fixtures, index: ["default.htm", "index.html"] }),
      )
        .get("/pets/")
        .expect(
          200,
          Deno.readTextFileSync(join(fixtures, "pets", "index.html")),
          done,
        );
    });

    it("should 404 if no index file found (file)", function (done) {
      superdeno(createServer({ root: fixtures, index: "default.htm" }))
        .get("/pets/")
        .expect(404, done);
    });

    it("should 404 if no index file found (dir)", function (done) {
      superdeno(createServer({ root: fixtures, index: "pets" }))
        .get("/")
        .expect(404, done);
    });

    it("should not follow directories", function (done) {
      superdeno(createServer({ root: fixtures, index: ["pets", "name.txt"] }))
        .get("/")
        .expect(200, "deno", done);
    });
  });

  describe("root", function () {
    describe("when given", function () {
      it("should join root", function (done) {
        superdeno(createServer({ root: fixtures }))
          .get("/pets/../name.txt")
          .expect(200, "deno", done);
      });
    });
  });
});
