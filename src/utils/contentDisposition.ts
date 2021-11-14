/*!
 * Partial port of content-disposition (https://github.com/jshttp/content-disposition)
 * for Deno.
 *
 * Licensed as follows:
 *
 * (The MIT License)
 *
 * Copyright (c) 2014-2017 Douglas Christopher Wilson
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

import { basename } from "../../deps.ts";

/**
 * RegExp to match non attr-char, *after* encodeURIComponent (i.e. not including "%")
 * @private
 */
const ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g; // eslint-disable-line no-control-regex

/**
 * RegExp to match percent encoding escape.
 * @private
 */
const HEX_ESCAPE_REGEXP = /%[0-9A-Fa-f]{2}/;

/**
 * RegExp to match non-latin1 characters.
 * @private
 */
const NON_LATIN1_REGEXP = /[^\x20-\x7e\xa0-\xff]/g;

/**
 * RegExp to match chars that must be quoted-pair in RFC 2616
 * @private
 */
const QUOTE_REGEXP = /([\\"])/g;

/**
 * RegExp for constious RFC 2616 grammar
 *
 * parameter     = token "=" ( token | quoted-string )
 * token         = 1*<any CHAR except CTLs or separators>
 * separators    = "(" | ")" | "<" | ">" | "@"
 *               | "," | ";" | ":" | "\" | <">
 *               | "/" | "[" | "]" | "?" | "="
 *               | "{" | "}" | SP | HT
 * quoted-string = ( <"> *(qdtext | quoted-pair ) <"> )
 * qdtext        = <any TEXT except <">>
 * quoted-pair   = "\" CHAR
 * CHAR          = <any US-ASCII character (octets 0 - 127)>
 * TEXT          = <any OCTET except CTLs, but including LWS>
 * LWS           = [CRLF] 1*( SP | HT )
 * CRLF          = CR LF
 * CR            = <US-ASCII CR, carriage return (13)>
 * LF            = <US-ASCII LF, linefeed (10)>
 * SP            = <US-ASCII SP, space (32)>
 * HT            = <US-ASCII HT, horizontal-tab (9)>
 * CTL           = <any US-ASCII control character (octets 0 - 31) and DEL (127)>
 * OCTET         = <any 8-bit sequence of data>
 * @private
 */
const TEXT_REGEXP = /^[\x20-\x7e\x80-\xff]+$/;
const TOKEN_REGEXP = /^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/;

/**
 * Get ISO-8859-1 version of string.
 *
 * @param {string} val
 * @return {string}
 * @private
 */
function getLatin1(val: any) {
  // simple Unicode -> ISO-8859-1 transformation
  return String(val).replace(NON_LATIN1_REGEXP, "?");
}

/**
 * Create parameters object from filename and fallback.
 *
 * @param {string} [filename]
 * @return {object}
 * @private
 */
function createParams(filename?: string) {
  if (filename === undefined) {
    return;
  }

  const params: any = {};

  if (typeof filename !== "string") {
    throw new TypeError("filename must be a string");
  }

  // restrict to file base name
  const name = basename(filename);

  // determine if name is suitable for quoted string
  const isQuotedString = TEXT_REGEXP.test(name);

  // generate fallback name
  const fallbackName = getLatin1(name);
  const hasFallback = typeof fallbackName === "string" && fallbackName !== name;

  // set extended filename parameter
  if (hasFallback || !isQuotedString || HEX_ESCAPE_REGEXP.test(name)) {
    params["filename*"] = name;
  }

  // set filename parameter
  if (isQuotedString || hasFallback) {
    params.filename = hasFallback ? fallbackName : name;
  }

  return params;
}

/**
 * Quote a string for HTTP.
 *
 * @param {string} val
 * @return {string}
 * @private
 */
function qString(val: any) {
  const str = String(val);

  return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
}

/**
 * Percent encode a single character.
 *
 * @param {string} char
 * @return {string}
 * @private
 */
function pencode(char: any) {
  return "%" + String(char)
    .charCodeAt(0)
    .toString(16)
    .toUpperCase();
}

/**
 * Encode a Unicode string for HTTP (RFC 5987).
 *
 * @param {string} val
 * @return {string}
 * @private
 */
function uString(val: any) {
  const str = String(val);

  // percent encode as UTF-8
  const encoded = encodeURIComponent(str)
    .replace(ENCODE_URL_ATTR_CHAR_REGEXP, pencode);

  return "UTF-8''" + encoded;
}

/**
 * Format object to Content-Disposition header.
 *
 * @param {object} obj
 * @param {string} obj.type
 * @param {object} [obj.parameters]
 * @return {string}
 * @private
 */
function format({ type, parameters }: { type: string; parameters: any }) {
  if (!type || typeof type !== "string" || !TOKEN_REGEXP.test(type)) {
    throw new TypeError("invalid type");
  }

  // start with normalized type
  let string = String(type).toLowerCase();

  // append parameters
  if (parameters && typeof parameters === "object") {
    let param;
    const params = Object.keys(parameters).sort();

    for (let i = 0; i < params.length; i++) {
      param = params[i];

      const val = param.substr(-1) === "*"
        ? uString(parameters[param])
        : qString(parameters[param]);

      string += "; " + param + "=" + val;
    }
  }

  return string;
}

/**
 * Creates a Content-Disposition Header value from
 * a type and an optional filename.
 *
 * @param {string} type
 * @param {string} [filename]
 * @returns {string}
 * @public
 */
export const contentDisposition = (type: string, filename?: string): string => {
  const parameters = createParams(filename);

  return format({
    type,
    parameters,
  });
};
