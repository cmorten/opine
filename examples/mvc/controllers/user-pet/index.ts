import * as db from "../../db.ts";
import type { NextFunction, Request, Response } from "../../../../src/types.ts";

export const name = "pet";
export const prefix = "/user/:user_id";

export const create = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.params.user_id;
  const user = db.users[parseInt(id)];
  const body = req.parsedBody;
  if (!user) return next("route");
  const pet: any = { name: body.pet.name };
  pet.id = db.pets.push(pet) - 1;
  user.pets.push(pet);
  res.redirect("/user/" + id);
};
