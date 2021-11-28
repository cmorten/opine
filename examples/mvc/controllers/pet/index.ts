// deno-lint-ignore-file no-explicit-any
import * as db from "../../db.ts";
import type {
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "../../../../src/types.ts";

export const before = function (
  req: OpineRequest,
  _res: OpineResponse,
  next: NextFunction,
) {
  const pet = db.pets[parseInt(req.params.pet_id)];
  if (!pet) return next("route");
  (req as any).pet = pet;
  next();
};

export const show = function (
  req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  res.render("show", { pet: (req as any).pet });
};

export const edit = function (
  req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  res.render("edit", { pet: (req as any).pet });
};

export const update = function (
  req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  const body = req.body;
  (req as any).pet.name = body.pet.name;
  res.redirect(`/pet/${(req as any).pet.id}`);
};
