import * as db from "../../db.ts";
import type { NextFunction, Request, Response } from "../../../../src/types.ts";

export const before = function (
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const id = req.params.user_id;
  if (!id) return next();
  // Pretend to query a database...
  setTimeout(function () {
    (req as any).user = db.users[parseInt(id)];
    // cant find that user
    if (!(req as any).user) return next("route");
    // found it, move on to the routes
    next();
  });
};

export const list = function (
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.render("list", { users: db.users });
};

export const edit = function (
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.render("edit", { user: (req as any).user });
};

export const show = function (
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.render("show", { user: (req as any).user });
};

export const update = function (
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const body = req.body;
  (req as any).user.name = body.user.name;
  res.redirect("/user/" + (req as any).user.id);
};
