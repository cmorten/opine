import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("graphql", () => {
  it("should respond to post requests on the graphql route", async () => {
    await superdeno(app)
      .post("/graphql")
      .send({ "query": "{ hello }" })
      .expect(200, `{\n  "data": {\n    "hello": "Hello World!"\n  }\n}`);
  });
});
