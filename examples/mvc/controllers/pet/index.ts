import * as db from "../../db.ts";
import type { NextFunction, Request, Response } from "../../../../src/types.ts";

export const before = function (
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const pet = db.pets[parseInt(req.params.pet_id)];
  if (!pet) return next("route");
  (req as any).pet = pet;
  next();
};

export const show = function (
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.render("show", { pet: (req as any).pet });
};

export const edit = function (
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.render("edit", { pet: (req as any).pet });
};

export const update = function (
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const body = req.parsedBody;
  (req as any).pet.name = body.pet.name;
  res.redirect(`/pet/${(req as any).pet.id}`);
};
