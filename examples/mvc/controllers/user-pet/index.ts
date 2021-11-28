import * as db from "../../db.ts";
import type {
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "../../../../src/types.ts";

export const name = "pet";
export const prefix = "/user/:user_id";

export const create = function (
  req: OpineRequest,
  res: OpineResponse,
  next: NextFunction,
) {
  const id = req.params.user_id;
  const user = db.users[parseInt(id)];
  const body = req.body;
  if (!user) return next("route");
  const pet: db.Pet = { name: body.pet.name };
  pet.id = db.pets.push(pet) - 1;
  user.pets!.push(pet);
  res.redirect("/user/" + id);
};
