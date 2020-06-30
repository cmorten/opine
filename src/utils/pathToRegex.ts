/**
 * Port of path-to-regexp (https://github.com/pillarjs/path-to-regexp/tree/v0.1.7) for Deno.
 * 
 * Licensed as follows:
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Blake Embrey (hello@blakeembrey.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

/**
 * Match matching groups in a regular expression.
 */
const MATCHING_GROUP_REGEXP = /\((?!\?)/g;

export type PathArray = (string | RegExp)[];
export type Path = string | RegExp | PathArray;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {string|RegExp|(string|RegExp)[]} path
 * @param  {any[]} keys
 * @param  {any} options
 * @return {RegExp}
 * @private
 */
export function pathToRegexp(
  path: Path,
  keys: any[],
  options: any,
): RegExp {
  options = options || {};
  keys = keys || [];
  const strict = options.strict;
  const end = options.end !== false;
  const flags = options.sensitive ? "" : "i";
  let extraOffset = 0;
  const keysOffset = keys.length;
  let i = 0;
  let name = 0;
  let m;

  if (path instanceof RegExp) {
    while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
      keys.push({
        name: name++,
        optional: false,
        offset: m.index,
      });
    }

    return path;
  }

  if (Array.isArray(path)) {
    // Map array parts into regexps and return their source. We also pass
    // the same keys and options instance into every generation to get
    // consistent matching groups before we join the sources together.
    path = path.map(function (value: string | RegExp): string {
      return pathToRegexp(value, keys, options).source;
    });

    return new RegExp("(?:" + path.join("|") + ")", flags);
  }

  path =
    ("^" + path + (strict ? "" : path[path.length - 1] === "/" ? "?" : "/?"))
      .replace(/\/\(/g, "/(?:")
      .replace(/([\/\.])/g, "\\$1")
      .replace(
        /(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g,
        function (match, slash, format, key, capture, star, optional, offset) {
          slash = slash || "";
          format = format || "";
          capture = capture || "([^\\/" + format + "]+?)";
          optional = optional || "";

          keys.push({
            name: key,
            optional: !!optional,
            offset: offset + extraOffset,
          });

          const result = "" +
            (optional ? "" : slash) +
            "(?:" +
            format + (optional ? slash : "") + capture +
            (star ? "((?:[\\/" + format + "].+?)?)" : "") +
            ")" +
            optional;

          extraOffset += result.length - match.length;

          return result;
        },
      )
      .replace(/\*/g, function (star, index) {
        let len = keys.length;

        while (len-- > keysOffset && keys[len].offset > index) {
          keys[len].offset += 3; // Replacement length minus asterisk length.
        }

        return "(.*)";
      });

  // This is a workaround for handling unnamed matching groups.
  while (m = MATCHING_GROUP_REGEXP.exec(path)) {
    let escapeCount = 0;
    let index = m.index;

    while (path.charAt(--index) === "\\") {
      escapeCount++;
    }

    // It's possible to escape the bracket.
    if (escapeCount % 2 === 1) {
      continue;
    }

    if (
      keysOffset + i === keys.length ||
      keys[keysOffset + i].offset > m.index
    ) {
      keys.splice(keysOffset + i, 0, {
        name: name++, // Unnamed matching groups must be consistently linear.
        optional: false,
        offset: m.index,
      });
    }

    i++;
  }

  // If the path is non-ending, match until the end or a slash.
  path += (end ? "$" : (path[path.length - 1] === "/" ? "" : "(?=\\/|$)"));

  return new RegExp(path, flags);
}
