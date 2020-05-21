/*!
 * Modified final handler for Deno.
 *
 * REF: https://raw.githubusercontent.com/pillarjs/finalHandler/master/index.js
 *
 * finalhandler
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

import { parseUrl } from "./utils.ts";
import { STATUS_TEXT } from "https://deno.land/std/http/http_status.ts";

var DOUBLE_SPACE_REGEXP = /\x20{2}/g;
var NEWLINE_REGEXP = /\n/g;

/**
 * Create a minimal HTML document.
 *
 * @param {string} message
 * @private
 */
function createHtmlDocument(message) {
  var body = message
    .replace(NEWLINE_REGEXP, "<br>")
    .replace(DOUBLE_SPACE_REGEXP, " &nbsp;");

  return (
    "<!DOCTYPE html>\n" +
    '<html lang="en">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>Error</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<pre>" +
    body +
    "</pre>\n" +
    "</body>\n" +
    "</html>\n"
  );
}

/**
 * Create a function to handle the final response.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Object} [options]
 * @return {Function}
 * @public
 */
function finalHandler(req, res, options) {
  var opts = options || {};

  return function (err) {
    var headers;
    var msg;
    var status;

    // unhandled error
    if (err) {
      // respect status code from error
      status = getErrorStatusCode(err);

      if (status === undefined) {
        // fallback to status code on response
        status = getResponseStatusCode(res);
      } else {
        // respect headers from error
        headers = getErrorHeaders(err);
      }

      // get error message
      msg = getErrorMessage(err, status);
    } else {
      // not found
      status = 404;
      msg = "Cannot " + req.method + " " + getResourceName(req);
    }

    // send response
    send(req, res, status, headers, msg);
  };
}

/**
 * Get headers from Error object.
 *
 * @param {Error} err
 * @return {object}
 * @private
 */

function getErrorHeaders(err) {
  if (!err.headers || typeof err.headers !== "object") {
    return undefined;
  }

  var headers = Object.create(null);
  var keys = Object.keys(err.headers);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    headers[key] = err.headers[key];
  }

  return headers;
}

/**
 * Get message from Error object, fallback to status message.
 *
 * @param {Error} err
 * @param {number} status
 * @param {string} env
 * @return {string}
 * @private
 */

function getErrorMessage(err, status) {
  // use err.stack, which typically includes err.message
  let msg = err.stack;

  // fallback to err.toString() when possible
  if (!msg && typeof err.toString === "function") {
    msg = err.toString();
  }

  return msg || STATUS_TEXT[status];
}

/**
 * Get status code from Error object.
 *
 * @param {Error} err
 * @return {number}
 * @private
 */

function getErrorStatusCode(err) {
  // check err.status
  if (typeof err.status === "number" && err.status >= 400 && err.status < 600) {
    return err.status;
  }

  return undefined;
}

/**
 * Get resource name for the request.
 *
 * This is typically just the original pathname of the request
 * but will fallback to "resource" is that cannot be determined.
 *
 * @param {IncomingMessage} req
 * @return {string}
 * @private
 */

function getResourceName(req) {
  try {
    return parseUrl(req).pathname;
  } catch (e) {
    return "resource";
  }
}

/**
 * Get status code from response.
 *
 * @param {OutgoingMessage} res
 * @return {number}
 * @private
 */

function getResponseStatusCode(res) {
  var status = res.status;

  // default status code to 500 if outside valid range
  if (typeof status !== "number" || status < 400 || status > 599) {
    status = 500;
  }

  return status;
}

/**
 * Send response.
 *
 * @param {IncomingMessage} req
 * @param {OutgoingMessage} res
 * @param {number} status
 * @param {object} headers
 * @param {string} message
 * @private
 */
function send(req, res, status, headers, message) {
  // response body
  const body = createHtmlDocument(message);

  // response status
  res.status = status;
  res.statusMessage = STATUS_TEXT[status];

  // response headers
  setHeaders(res, headers);

  // security headers
  res.set("Content-Security-Policy", "default-src 'none'");
  res.set("X-Content-Type-Options", "nosniff");

  res.send(body);
}

/**
 * Set response headers from an object.
 *
 * @param {OutgoingMessage} res
 * @param {object} headers
 * @private
 */

function setHeaders(res, headers) {
  if (!headers) {
    return;
  }

  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    res.set(key, headers[key]);
  }
}

export default finalHandler;
