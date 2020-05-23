import { Request } from "../../types.ts";
import { hasBody } from "./hasBody.ts";
import { contentType } from "../../../deps.ts";

function normalize(type: any) {
  return contentType(type || "")?.split(";")[0];
}

function typeIs(req: Request, type: string) {
  if (!hasBody(req)) {
    return false;
  }

  return normalize(req.headers.get("Content-Type")) === normalize(type);
}

/**
 * Get the simple type checker.
 *
 * @param {string} type
 * @return {function}
 */
export function typeChecker(type: string) {
  return function checkType(req: Request) {
    return Boolean(typeIs(req, type));
  };
}
