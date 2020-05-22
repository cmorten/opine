/*!
 * Adapted etag for Deno.
 *
 * REF: https://github.com/jshttp/etag/blob/master/index.js
 *
 * etag
 * Copyright(c) 2014-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import { Sha1, encoder } from "../../deps.ts";

const toString = Object.prototype.toString;

/**s
 * Generate an entity tag.
 *
 * @param {any} entity
 * @return {string}
 * @private
 */
function entitytag(entity: any): string {
  if (entity.length === 0) {
    // fast-path empty
    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  }

  // compute hash of entity
  const sha1 = new Sha1();
  sha1.update(entity);
  sha1.digest();
  const hash = sha1.toString().substring(0, 27);

  // compute length of entity
  var len = typeof entity === "string"
    ? encoder.encode(entity).byteLength
    : entity.byteLength;

  return `"${len.toString(16)}-${hash}"`;
}

/**
 * Determine if object is a Stats object.
 *
 * @param {object} obj
 * @return {boolean}
 * @private
 */
function isstats(obj: any): boolean {
  // TODO: genuine(?) Deno.FileInfo identification

  // quack quack
  return obj && typeof obj === "object" &&
    "atime" in obj &&
    "mtime" in obj &&
    "birthtime" in obj &&
    "size" in obj && typeof obj.size === "number";
}

/**
 * Generate a tag for a stat.
 *
 * @param {object} stat
 * @return {string}
 * @private
 */
function stattag(stat: Deno.FileInfo) {
  const mtime = new Date(stat.mtime as Date).getTime().toString(16);
  const size = stat.size.toString(16);

  return '"' + size + "-" + mtime + '"';
}

/**
 * Create a simple ETag.
 *
 * @param {string|Uint8Array|Deno.FileInfo} entity
 * @param {object} [options]
 * @param {boolean} [options.weak]
 * @return {string}
 * @public
 */
export function etag(
  entity: string | Uint8Array | Deno.FileInfo,
  options: any,
) {
  if (entity == null) {
    throw new TypeError("argument entity is required");
  }

  let entityObj = entity;
  if (typeof entity === "string") {
    try {
      // In case have stringify the Deno.FileInfo object.
      entityObj = JSON.parse(entity);
    } catch (_) {}
  }

  // support fs.Stats object
  const isStats = isstats(entityObj);
  const weak = options && typeof options.weak === "boolean"
    ? options.weak
    : isStats;

  // validate argument
  if (
    !isStats && typeof entity !== "string" && !(entity instanceof Uint8Array)
  ) {
    throw new TypeError(
      "argument entity must be string, Uint8Array, or Deno.FileInfo",
    );
  }

  // generate entity tag
  const tag = isStats ? stattag(entityObj as Deno.FileInfo) : entitytag(entity);

  return weak ? `W/${tag}` : tag;
}
