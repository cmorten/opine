import opine from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const mockUser = Symbol("test-user");
const mockAge = Symbol("test-age");
const mockSetting = "test-setting";
const mockValue = Symbol("test-value");

describe("app", () => {
  describe(".locals(obj)", () => {
    it("should merge locals", () => {
      const app = opine();

      expect(Object.keys(app.locals)).toEqual(["settings"]);

      app.locals.user = mockUser;
      app.locals.age = mockAge;

      expect(Object.keys(app.locals)).toEqual(["settings", "user", "age"]);
      expect(app.locals.user).toEqual(mockUser);
      expect(app.locals.age).toEqual(mockAge);
    });
  });

  describe(".locals.settings", () => {
    it("should expose app settings", () => {
      const app = opine();
      app.set(mockSetting, mockValue);

      const obj = app.locals.settings;
      expect(obj).toHaveProperty(mockSetting);
      expect(obj[mockSetting]).toEqual(mockValue);
    });
  });
});
