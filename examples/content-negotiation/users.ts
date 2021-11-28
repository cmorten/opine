import { users } from "./db.ts";
import type { OpineRequest, OpineResponse } from "../../src/types.ts";

export const html = (_req: OpineRequest, res: OpineResponse) => {
  res.send(
    `<ul>${users.map((user) => `<li>${user.name}</li>`).join("")}</ul>`,
  );
};

export const text = (_req: OpineRequest, res: OpineResponse) => {
  res.send(users.map((user) => ` - ${user.name}\n`).join(""));
};

export const json = (_req: OpineRequest, res: OpineResponse) => {
  res.json(users);
};
