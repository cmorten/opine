/**
 * Updated from https://deno.land/x/http_errors
 *
 * Licensed as follows:
 *
 * Copyright (c) 2020 Henry Zhuang
 * MIT Licensed
 */

import { Status, STATUS_TEXT } from "../../deps.ts";

abstract class HttpError extends Error {
  name: string;
  message: string;
  status: number;
  statusCode: number;
  expose = false;
  [key: string]: unknown

  constructor(code: number, message?: string) {
    super(message);

    if (!Status[code]) {
      throw TypeError(`Unknown HTTP Status Code \`${code}\``);
    }

    if (code < 400 || code >= 600) {
      throw TypeError(
        `Only 4xx or 5xx status codes allowed, but got \`${code}\``,
      );
    }

    if (code >= 400 && code < 500) {
      this.expose = true;
    }

    let className = Status[code];

    if (!className.endsWith("Error")) {
      className += "Error";
    }

    const msg = message != null ? message : STATUS_TEXT.get(code)!;
    this.message = msg;
    this.status = this.statusCode = code;
    this.name = className;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toString() {
    return `${this.name} [${this.status}]: ${this.message}`;
  }

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      message: this.message,
    };
  }
}

class HttpErrorImpl extends HttpError {}

interface Props {
  [key: string]: unknown;
}

interface IError extends Error {
  status: number;
  statusCode: number;
  expose: boolean;
  [key: string]: unknown;
}

/**
 * Create a new HttpError.
 *
 * @returns {HttpError}
 * @public
 */

export function createError(
  status: number,
  message?: string,
  props?: Props,
): HttpError;
export function createError(status: number, props: Props): HttpError;
export function createError(err: Error, props?: Props): IError;
export function createError(
  status: unknown,
  message?: unknown,
  props?: Props,
): HttpError | Error {
  let err;

  if (status instanceof Error) {
    err = status as IError;
    status = err.status || err.statusCode;

    if (
      typeof status !== "number" ||
      (!Status[status] && (status < 400 || status >= 600))
    ) {
      status = 500;
    }

    props = message as Props;
  } else if (typeof message === "string") {
    err = new HttpErrorImpl(status as number, message);
    Error.captureStackTrace(err, createError);
  } else {
    props = message as Props;
    err = new HttpErrorImpl(status as number);
    Error.captureStackTrace(err, createError);
  }

  if (!(err instanceof HttpError) || err.status !== status) {
    // add properties to generic error
    err.expose = status as number < 500;
    err.status = err.statusCode = status as number;
  }

  if (props) {
    for (const key in props) {
      if (key !== "status") {
        err[key] = props[key];
      }
    }
  }

  return err;
}
