import type { OpineRequest, OpineResponse } from "../../../../src/types.ts";

export const index = function (_req: OpineRequest, res: OpineResponse) {
  res.redirect("/users");
};
