import { formData } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const encoder = new TextEncoder();
const mockString = "deno formData testing";

const mockFormDataString = `
--opineBoundary
Content-Disposition: form-data; name="hello"

deno
--opineBoundary
Content-Disposition: form-data; name="file"; filename="file.txt"
Content-Type: application/octet-stream

${mockString}
--opineBoundary--
`.replaceAll(/\n/g, "\r\n");

const mockFormData = new FormData();
mockFormData.append("file", new File([encoder.encode(mockString)], "file.txt"));
mockFormData.append("hello", "deno");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");
textHeaders.set("Content-Length", "1");

const formDataHeaders = new Headers();
formDataHeaders.set(
  "Content-Type",
  "multipart/form-data; boundary=opineBoundary",
);

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

  it("should handle requests with body", (done) => {
    const req: any = {
      headers: formDataHeaders,
      raw: new Deno.Buffer(encoder.encode(mockFormDataString)),
    };

    req.headers.set("Content-Length", "1");

    const parser = formData();

    parser(req, {} as any, async (err?: any) => {
      if (err) throw err;

      const mockFile = (mockFormData.get("file") as File);

      expect(req.parsedBody.get("file").size).toEqual(mockFile.size);
      expect(req.parsedBody.get("file").name).toEqual(mockFile.name);
      expect(await req.parsedBody.get("file").text()).toEqual(
        await mockFile.text(),
      );

      expect(req.parsedBody.get("hello")).toEqual(mockFormData.get("hello"));

      done();
    });
  });

  it("should handle requests without boundary", (done) => {
    const noBoundaryHeaders = new Headers();
    noBoundaryHeaders.set(
      "Content-Type",
      "multipart/form-data",
    );

    const req: any = { headers: noBoundaryHeaders };
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
