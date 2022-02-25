import { formData } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const mockFormData = new FormData();

mockFormData.append("hello", "deno");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");
textHeaders.set("Content-Length", "1");

const formDataHeaders = new Headers();
formDataHeaders.set("Content-Type", "multipart/form-data; boundary=----opineBoundary");

describe("bodyParser: formData", () => {
  it("should handle requests without bodies", (done) => {
    const req: any = { headers: formDataHeaders };
    const parser = formData();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.parsedBody).toEqual(new FormData());
      done();
    });
  });

  it("should not alter request bodies when the content type is not multipart", (done) => {
    const mockBody = Symbol("test-body");
    const req: any = {
      body: mockBody,
      headers: textHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = formData();

    parser(req, {} as any, (err?: unknown) => {
      if (err) throw err;
      expect(req.body).toEqual(mockBody);
      expect(req.parsedBody).toBeUndefined();
      done();
    });
  });
});
