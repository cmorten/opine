import opine from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const mockSetting = "test-setting";
const mockValue = Symbol("test-value");

describe("config", () => {
  describe(".set()", () => {
    it("should set a value", () => {
      const app = opine();
      app.set(mockSetting, mockValue);
      expect(app.get(mockSetting)).toEqual(mockValue);
    });

    it("should return the app", () => {
      const app = opine();
      expect(app.set(mockSetting, mockValue)).toEqual(app);
    });

    it("should return the app when undefined", () => {
      const app = opine();
      expect(app.set(mockSetting, undefined)).toEqual(app);
    });

    describe('"etag"', () => {
      it("should throw on bad value", () => {
        const app = opine();
        expect(app.set.bind(app, "etag", 42)).toThrow(/unknown value/);
      });

      it('should set "etag fn"', () => {
        const app = opine();
        const fn = () => {};
        app.set("etag", fn);
        expect(app.get("etag fn")).toEqual(fn);
      });
    });
  });

  describe(".get()", () => {
    it("should return undefined when unset", () => {
      const app = opine();
      expect(app.get(mockSetting)).toBe(undefined);
    });

    it("should otherwise return the value", () => {
      const app = opine();
      app.set(mockSetting, mockValue);
      expect(app.get(mockSetting)).toEqual(mockValue);
    });

    describe("when mounted", () => {
      it("should default to the parent app", () => {
        const app = opine();
        const blog = opine();

        app.set(mockSetting, mockValue);
        app.use(blog);
        expect(blog.get(mockSetting)).toEqual(mockValue);
      });

      it("should given precedence to the child", () => {
        const mockChildValue = Symbol("test-child-value");
        const app = opine();
        const blog = opine();

        app.use(blog);
        app.set(mockSetting, mockValue);
        blog.set(mockSetting, mockChildValue);

        expect(blog.get(mockSetting)).toEqual(mockChildValue);
      });
    });
  });

  describe(".enable()", () => {
    it("should set the value to true", () => {
      const app = opine();
      expect(app.enable(mockSetting)).toEqual(app);
      expect(app.get(mockSetting)).toBe(true);
    });
  });

  describe(".disable()", () => {
    it("should set the value to false", () => {
      const app = opine();
      expect(app.disable(mockSetting)).toEqual(app);
      expect(app.get(mockSetting)).toBe(false);
    });
  });

  describe(".enabled()", () => {
    it("should default to false", () => {
      const app = opine();
      expect(app.enabled(mockSetting)).toBe(false);
    });

    it("should return true when set", () => {
      const app = opine();
      app.set(mockSetting, mockValue);
      expect(app.enabled(mockSetting)).toBe(true);
    });
  });

  describe(".disabled()", () => {
    it("should default to true", () => {
      const app = opine();
      expect(app.disabled(mockSetting)).toBe(true);
    });

    it("should return false when set", () => {
      const app = opine();
      app.set(mockSetting, mockValue);
      expect(app.disabled(mockSetting)).toBe(false);
    });
  });
});
