import { extname, resolve, dirname, basename, join } from "../deps.ts";

/**
 * Return a stat, maybe.
 *
 * @param {string} path
 * @return {Deno.FileInfo}
 * @private
 */
function tryStat(path: string) {
  try {
    return Deno.statSync(path);
  } catch (e) {
    return undefined;
  }
}


export class View {
  defaultEngine!: any;
  ext!: any;
  name!: any;
  root!: any;
  engine!: any;
  path!: any;

  /**
   * Initialize a new `View` with the given `name`.
   *
   * Options:
   *
   *   - `defaultEngine` the default template engine name
   *   - `engines` template engine require() cache
   *   - `root` root path for view lookup
   *
   * @param {string} name
   * @param {object} options
   */
  constructor(fileName: string, options: any = {}) {
    this.defaultEngine = options.defaultEngine;
    this.ext = extname(fileName);
    this.name = fileName;
    this.root = options.root;

    if (!this.ext && !this.defaultEngine) {
      throw new Error(
        "No default engine was specified and no extension was provided.",
      );
    }

    if (!this.ext) {
      // get extension from default engine name
      this.ext = this.defaultEngine[0] !== "."
        ? `.${this.defaultEngine}`
        : this.defaultEngine;

      fileName += this.ext;
    }

    if (!options.engines[this.ext]) {
      // TODO: consider if any way to dynamic import view engines based
      // off of extension name - likely difficult without import maps
      // or equivalent.
      throw new Error(
        `Could not find a view engine for extension "${this.ext}"`,
      );
    }

    // store loaded engine
    this.engine = options.engines[this.ext];

    // lookup path
    this.path = this.lookup(fileName);
  }

  /**
   * Resolve the file within the given directory.
   *
   * @param {string} dir
   * @param {string} file
   * @private
   */
  resolve(dir: string, file: string) {
    const path = join(dir, file);
    const stat = tryStat(path);

    if (stat && stat.isFile) {
      return path;
    }
  }

  /**
   * Lookup view by the given `name`
   *
   * @param {string} name
   * @private
   */
  lookup(name: string) {
    const roots = [].concat(this.root);
    let path;

    for (let i = 0; i < roots.length && !path; i++) {
      const root = roots[i];
      const loc = resolve(root, name);
      const dir = dirname(loc);
      const file = basename(loc);

      path = this.resolve(dir, file);
    }

    return path;
  }

  /**
   * Render with the given options.
   *
   * @param {object} options
   * @param {Function} callback
   * @private
   */
  render(options: object, callback: Function) {
    this.engine(this.path, options, callback);
  };
}
