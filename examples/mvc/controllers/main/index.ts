import type { Request, Response } from "../../../../src/types.ts";

export const index = function (_req: Request, res: Response) {
  res.redirect("/users");
};
