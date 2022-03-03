import type { NextFunction, OpineRequest, OpineResponse } from "../../types.ts";
import { hasBody, MultipartReader } from "../../../deps.ts";
import { typeChecker } from "./typeChecker.ts";

/**
 * Create a middleware to parse formData.
 *
 * @param {object} [options]
 * @return {function}
 * @public
 */
export function formData(options: any = {}) {
  const type = options.type || "multipart/form-data";
  const verify = options.verify || false;

  if (verify !== false && typeof verify !== "function") {
    throw new TypeError("option verify must be function");
  }

  // create the appropriate type checking function
  const shouldParse = typeof type !== "function" ? typeChecker(type) : type;

  return function formParser(
    req: OpineRequest,
    _res: OpineResponse,
    next: NextFunction,
  ) {
    if (req._parsedBody) {
      next();

      return;
    }

    // skip requests without bodies
    if (
      !hasBody(req.headers) ||
      parseInt(req.headers.get("content-length") || "") === 0
    ) {
      req.parsedBody = new FormData();
      req.body = req.parsedBody;

      next();

      return;
    }

    // determine if request should be parsed
    if (!shouldParse(req)) {
      next();

      return;
    }

    // read
    const type = req.headers.get("Content-Type");

    if (!type) {
      req.parsedBody = new FormData();
      req.body = req.parsedBody;

      next();

      return;
    }

    const boundary = type.match(/boundary=(?:([^;]+))/);

    if(boundary == null) {
      req.parsedBody = new FormData();
      req.body = req.parsedBody;

      next();

      return;
    }

    const mr = new MultipartReader(req.raw, boundary[boundary.length - 1]);
    const body = mr.readForm();

    req._parsedBody = true;
    req.parsedBody = body;
    req.body = body;
    next();
  };
}
