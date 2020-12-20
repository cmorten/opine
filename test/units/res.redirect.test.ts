import opine from "../../mod.ts";
import { describe, it, pick } from "../utils.ts";
import { Deferred, deferred, expect, superdeno } from "../deps.ts";
import type { SuperDenoResponse } from "../deps.ts";
import type { Handler, Request, Response } from "../../src/types.ts";

type DeferredTestResult = Deferred<
  {
    status?: number;
    location?: string | null;
    contentType?: string | null;
    body: string | null;
  }
>;

function createRedirectMiddleware(
  redirectArgs: any[],
  deferredPromise: DeferredTestResult,
): Handler {
  return function redirectMiddleware(req, res, next) {
    (res.redirect as any)(...redirectArgs);

    // Does not support Deno.Reader.
    let body: string | null = null;

    if (typeof res.body === "string") {
      body = res.body;
    } else if (res.body instanceof Uint8Array) {
      body = new TextDecoder().decode(res.body);
    }

    deferredPromise.resolve({
      status: res.status,
      location: res.headers?.get("location"),
      contentType: res.headers?.get("content-type"),
      body: typeof body === "string" ? body : null,
    });
  };
}

function handleRedirectTarget(req: Request, res: Response) {
  res.json({ url: req.originalUrl, query: req.query });
}

function shouldNotHaveBody() {
  return function (res: SuperDenoResponse) {
    expect(res.text === "" || res.text == null).toBe(true);
  };
}

describe("res", function () {
  describe(".redirect(url)", function () {
    it("should default to a 302 redirect", async function (done) {
      const location = "/to";
      const app = opine();
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .expect(200, { url: "/to", query: {} }, done);

      expect(pick(await output, ["status", "location"])).toEqual({
        status: 302,
        location,
      });
    });

    it('should encode "url"', async function (done) {
      const app = opine();
      const location = "/to?q=\u2603 §10";
      const escapedLocation = "/to?q=%E2%98%83%20%C2%A710";
      const locationSearchParams = new URLSearchParams(
        location.slice(location.indexOf("?")),
      );
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .expect(
          200,
          {
            url: escapedLocation,
            query: { q: locationSearchParams.get("q") },
          },
          done,
        );

      expect(pick(await output, ["status", "location"])).toEqual({
        status: 302,
        location: escapedLocation,
      });
    });

    it('should not touch already-encoded sequences in "url"', async function (
      done,
    ) {
      const app = opine();
      const location = "/to?q=%20%20deno%26";
      const locationSearchParams = new URLSearchParams(
        location.slice(location.indexOf("?")),
      );
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .expect(200, {
          url: location,
          query: { q: locationSearchParams.get("q") },
        }, done);

      expect(pick(await output, ["status", "location"])).toEqual({
        status: 302,
        location,
      });
    });
  });

  describe(".redirect(status, url)", function () {
    it("should set the response status", async function (done) {
      const app = opine();
      const expectedStatus = 303;
      const location = "/to";
      const output: DeferredTestResult = deferred();

      app.use(
        "/from",
        createRedirectMiddleware([expectedStatus, location], output),
      );
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .expect(200, { url: location, query: {} }, done);

      expect(pick(await output, ["status", "location"])).toEqual({
        status: expectedStatus,
        location,
      });
    });

    it("should throw exception (500) if the first arg is not a number", async function (
      done,
    ) {
      const app = opine();
      const expectedStatus = "303";
      const location = "/to";
      const output: DeferredTestResult = deferred();

      app.use(
        "/from",
        createRedirectMiddleware([expectedStatus, location], output),
      );
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .expect(500, done);
    });
  });

  describe("when url is back", function () {
    it("should redirect to the referrer header", async function (done) {
      const app = opine();
      const location = "back";
      const output: DeferredTestResult = deferred();
      const referrer = "/to?referrer=ok";

      app.use("/from", createRedirectMiddleware(["back"], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Referrer", referrer)
        .expect(200, { url: referrer, query: { referrer: "ok" } }, done);

      expect(pick(await output, ["status", "location"])).toEqual({
        status: 302,
        location: referrer,
      });
    });
  });

  describe("when the request method is HEAD", function () {
    it("should ignore the body", function (done) {
      const app = opine();
      const location = "/to";
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .head("/from")
        .redirects(-1)
        .expect(shouldNotHaveBody())
        .expect(200, done);
    });
  });

  describe("when accepting html", function () {
    it("should respond with html", async function (done) {
      const app = opine();
      const expectedStatus = 307;
      const expectedBody =
        '<p>Temporary Redirect. Redirecting to <a href="/to">/to</a></p>';
      const location = "/to";
      const output: DeferredTestResult = deferred();

      app.use(
        "/from",
        createRedirectMiddleware([expectedStatus, location], output),
      );
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Accept", "text/html")
        .expect(200, { url: location, query: {} }, done);

      expect(await output).toEqual({
        status: expectedStatus,
        location,
        contentType: "text/html; charset=utf-8",
        body: expectedBody,
      });
    });

    it("should escape the url and include the redirect type", async function (
      done,
    ) {
      const app = opine();
      const location = "/<la'me>";
      const expectedBody =
        `<p>Found. Redirecting to <a href="/%3Cla&#39;me%3E">/%3Cla&#39;me%3E</a></p>`;
      const escapedLocation = "/%3Cla'me%3E";
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/*", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Host", "http://example.com")
        .set("Accept", "text/html")
        .expect(200, { url: escapedLocation, query: {} }, done);

      expect(await output).toEqual({
        status: 302,
        location: escapedLocation,
        contentType: "text/html; charset=utf-8",
        body: expectedBody,
      });
    });
  });

  describe("when accepting text", function () {
    it("should respond with text", async function (done) {
      const app = opine();
      const location = "/to";
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Accept", "text/plain, */*")
        .expect(200, { url: location, query: {} }, done);

      expect(await output).toEqual({
        status: 302,
        location,
        contentType: "text/plain; charset=utf-8",
        body: "Found. Redirecting to /to",
      });
    });

    it("should encode the url", async function (done) {
      const app = opine();
      const location = `/to?param=<script>alert("hax");</script>`;
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Host", "http://example.com")
        .set("Accept", "text/plain, */*")
        .expect(200, done);

      expect(await output).toEqual({
        status: 302,
        location: "/to?param=%3Cscript%3Ealert(%22hax%22);%3C/script%3E",
        contentType: "text/plain; charset=utf-8",
        body:
          "Found. Redirecting to /to?param=%3Cscript%3Ealert(%22hax%22);%3C/script%3E",
      });
    });

    it("should include the redirect type", async function (done) {
      const app = opine();
      const location = "/to";
      const output: DeferredTestResult = deferred();
      const expectedBody = "Moved Permanently. Redirecting to /to";

      app.use("/from", createRedirectMiddleware([301, location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Accept", "text/plain, */*")
        .expect(200, done);

      expect(await output).toEqual({
        status: 301,
        location,
        contentType: "text/plain; charset=utf-8",
        body: expectedBody,
      });
    });
  });

  describe("when accepting neither text or html", function () {
    it("should respond with an empty body", async function (done) {
      const app = opine();
      const location = "/to";
      const output: DeferredTestResult = deferred();

      app.use("/from", createRedirectMiddleware([301, location], output));
      app.use("/to", handleRedirectTarget);

      superdeno(app)
        .get("/from")
        .redirects(-1)
        .set("Accept", "application/octet-stream")
        .expect(200, { url: "/to", query: {} }, done);

      const resolvedOutput = await output;

      expect(pick(resolvedOutput, ["status"])).toEqual({
        status: 301,
      });

      expect(resolvedOutput.contentType == null).toBe(true);
      expect(resolvedOutput.body == null || resolvedOutput.body === "").toBe(
        true,
      );
    });
  });
});
