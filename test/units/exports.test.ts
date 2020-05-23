import { opine, Router, application, request, response } from "../../mod.ts";
import { expect } from "../deps.ts";
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

  // it("should permit modifying the .request prototype", function (done) {
  //   opine.request.foo = () => {
  //     return "bar";
  //   };
  //   var app = opine();

  //   app.use(function (req, res, next) {
  //     res.end(req.foo());
  //   });

  //   request(app)
  //     .get("/")
  //     .expect("bar", done);
  // });

  // it("should permit modifying the .response prototype", function (done) {
  //   opine.response.foo = () => {
  //     this.send("bar");
  //   };
  //   var app = opine();

  //   app.use(function (req, res, next) {
  //     res.foo();
  //   });

  //   request(app)
  //     .get("/")
  //     .expect("bar", done);
  // });
});
