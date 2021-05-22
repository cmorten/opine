import { users } from "./db.ts";
import type { Request, Response } from "../../src/types.ts";

export const html = (_req: Request, res: Response) => {
  res.send(
    `<ul>${users.map((user) => `<li>${user.name}</li>`).join("")}</ul>`,
  );
};

export const text = (_req: Request, res: Response) => {
  res.send(users.map((user) => ` - ${user.name}\n`).join(""));
};

export const json = (_req: Request, res: Response) => {
  res.json(users);
};
