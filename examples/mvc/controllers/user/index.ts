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
  _req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  res.render("list", { users: db.users });
};

export const edit = function (
  req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  res.render("edit", { user: (req as any).user });
};

export const show = function (
  req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  res.render("show", { user: (req as any).user });
};

export const update = function (
  req: OpineRequest,
  res: OpineResponse,
  _next: NextFunction,
) {
  const body = req.body;
  (req as any).user.name = body.user.name;
  res.redirect("/user/" + (req as any).user.id);
};
