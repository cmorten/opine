// deno-lint-ignore-file no-explicit-any
import { application, opine, request, response, Router } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("exports", () => {
  it("should expose Router", () => {
    expect(Router).toBeInstanceOf(Function);
  });

  it("should expose the application prototype", () => {
    expect(application.set).toBeInstanceOf(Function);
  });

  it("should expose the request prototype", () => {
    expect(request.get).toBeInstanceOf(Function);
  });

  it("should expose the response prototype", () => {
    expect(response.send).toBeInstanceOf(Function);
  });

  it("should permit modifying the .application prototype", () => {
    const mockReturnValue = Symbol("test-return-value");

    (application as any).mockExtensionMethod = () => {
      return mockReturnValue;
    };
    expect((opine() as any).mockExtensionMethod()).toEqual(mockReturnValue);
  });

  it("should permit modifying the .request prototype", function (done) {
    (request as any).foo = function () {
      return "bar";
    };
    const app = opine();

    app.use(function (req, res, next) {
      res.end((req as any).foo());
    });

    superdeno(app)
      .get("/")
      .expect("bar", done);
  });

  it("should permit modifying the .response prototype", function (done) {
    (response as any).foo = function () {
      (this as any).send("bar");
    };
    const app = opine();

    app.use(function (req, res, next) {
      (res as any).foo();
    });

    superdeno(app)
      .get("/")
      .expect("bar", done);
  });
});
