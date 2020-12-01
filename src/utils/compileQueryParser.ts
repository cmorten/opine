import { parse, qs } from "../../deps.ts";

/**
 * Return new empty object.
 *
 * @return {Object}
 * @api private
 */
function newObject() {
  return {};
}

/**
 * Parse an extended query string with qs.
 *
 * @return {Object}
 * @private
 */
function parseExtendedQueryString(str: string) {
  return qs.parse(str, {
    allowPrototypes: true,
  });
}

type QueryParserValue = Function | Boolean | "extended" | "simple";

/**
 * Compile "query parser" value to function.
 *
 * @param  {String|Boolean|Function} val
 * @return {Function}
 * @api private
 */
export function compileQueryParser(value: QueryParserValue): Function {
  if (typeof value === "function") {
    return value;
  }

  switch (value) {
    case true:
      return parse;
    case false:
      return newObject;
    case "extended":
      return parseExtendedQueryString;
    case "simple":
      return parse;
    default:
      throw new TypeError(`unknown value for query parser function: ${value}`);
  }
}
