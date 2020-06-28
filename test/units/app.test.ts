import opine from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("app", () => {
  it("should inherit from event emitter", async (done) => {
    const mockEvent = "test-event";
    const mockArg = Symbol("test-arg");

    const app = opine();
    app.on(mockEvent, (arg) => {
      expect(arg).toBe(mockArg);
      done();
    });
    app.emit(mockEvent, mockArg);
  });

  it("should be callable", () => {
    const app = opine();
    expect(typeof app).toEqual("function");
  });

  it("should 404 without routes", (done) => {
    const app = opine();
    superdeno(app).get("/").expect(404, done);
  });
});

describe("app.parent", () => {
  it("should return the parent when mounted", () => {
    const app = opine();
    const blog = opine();
    const blogAdmin = opine();

    app.use("/blog", blog);
    blog.use("/admin", blogAdmin);

    expect(app.parent).toBeUndefined();
    expect(blog.parent).toEqual(app);
    expect(blogAdmin.parent).toEqual(blog);
  });
});

describe("app.mountpath", () => {
  it("should return the mounted path", () => {
    const admin = opine();
    const app = opine();
    const blog = opine();
    const fallback = opine();

    app.use("/blog", blog);
    app.use(fallback);
    blog.use("/admin", admin);

    expect(admin.mountpath).toEqual("/admin");
    expect(app.mountpath).toEqual("/");
    expect(blog.mountpath).toEqual("/blog");
    expect(fallback.mountpath).toEqual("/");
  });
});

describe("app.path()", () => {
  it("should return the canonical", () => {
    const app = opine();
    const blog = opine();
    const blogAdmin = opine();

    app.use("/blog", blog);
    blog.use("/admin", blogAdmin);

    expect(app.path()).toEqual("");
    expect(blog.path()).toEqual("/blog");
    expect(blogAdmin.path()).toEqual("/blog/admin");
  });
});

describe("view cache", () => {
  it('should enable "view cache" by default', function () {
    const app = opine();
    expect(app.enabled("view cache")).toBeTruthy();
  });
});
