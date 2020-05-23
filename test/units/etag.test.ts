import { etag, wetag } from "../../src/utils/compileETag.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("etag(body)", function () {
  it("should support strings", function () {
    expect(etag("opine!")).toEqual('"6-331971ea313f9b3c58b20a2d604"');
  });

  it("should support utf8 strings", function () {
    expect(etag("opine❤"))
      .toEqual('"8-9d8d9352c939ef86574bccbd3c4"');
  });

  it("should support Uint8Array", function () {
    const encoder = new TextEncoder();
    expect(etag(encoder.encode("opine!")))
      .toEqual('"6-331971ea313f9b3c58b20a2d604"');
  });

  it("should support empty string", function () {
    expect(etag(""))
      .toEqual('"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
  });
});

describe("wetag(body, encoding)", function () {
  it("should support strings", function () {
    expect(wetag("opine!"))
      .toEqual('W/"6-331971ea313f9b3c58b20a2d604"');
  });

  it("should support utf8 strings", function () {
    expect(wetag("opine❤"))
      .toEqual('W/"8-9d8d9352c939ef86574bccbd3c4"');
  });

  it("should support buffer", function () {
    const encoder = new TextEncoder();
    expect(wetag(encoder.encode("opine!")))
      .toEqual('W/"6-331971ea313f9b3c58b20a2d604"');
  });

  it("should support empty string", function () {
    expect(wetag(""))
      .toEqual('W/"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
  });
});
