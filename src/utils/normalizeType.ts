import { lookup } from "../../deps.ts";

/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 *
 * @param {string} str
 * @return {any}
 * @private
 */
function acceptParams(str: string) {
  const parts = str.split(/ *; */);
  const ret = { value: parts[0], quality: 1, params: {} as any };

  for (let i = 1; i < parts.length; ++i) {
    const pms = parts[i].split(/ *= */);

    if ("q" === pms[0]) {
      ret.quality = parseFloat(pms[1]);
    } else {
      ret.params[pms[0]] = pms[1];
    }
  }

  return ret;
}

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {string} type
 * @return {any}
 * @private
 */
export const normalizeType = function (type: string): any {
  return ~type.indexOf("/")
    ? acceptParams(type)
    : { value: lookup(type), params: {} };
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {string[]} types
 * @return {any[]}
 * @private
 */
export const normalizeTypes = function (types: string[]): any[] {
  const ret = [];

  for (let i = 0; i < types.length; ++i) {
    ret.push(normalizeType(types[i]));
  }

  return ret;
};
