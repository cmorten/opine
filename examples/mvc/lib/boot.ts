import { opine } from "../../../mod.ts";
import type { Application } from "../../../src/types.ts";
import { dirname, join } from "../../../deps.ts";
import { renderFileToString } from "../deps.ts";

const rootDirname = dirname(import.meta.url);

export default async function (parent: Application) {
  const dir = new URL("controllers/", rootDirname);

  for (const { name: fileName } of Deno.readDirSync(dir)) {
    const filePath = new URL(`${fileName}/index.ts`, dir);
    const obj = await import(filePath.toString());
    const name = obj.name ?? fileName;
    const prefix = obj.prefix ?? "";
    const app = opine();

    let handler;
    let method;
    let url;

    app.set("view engine", "ejs");
    app.engine(".ejs", renderFileToString);
    app.set("views", join(rootDirname, "..", "controllers", name, "views"));

    // Generate routes based on the exported methods
    for (const key in obj) {
      // "Reserved" exports
      if (~["name", "prefix", "before"].indexOf(key)) continue;
      // Route exports
      switch (key) {
        case "show":
          method = "get";
          url = `/${name}/:${name}_id`;
          break;
        case "list":
          method = "get";
          url = `/${name}s`;
          break;
        case "edit":
          method = "get";
          url = `/${name}/:${name}_id/edit`;
          break;
        case "update":
          method = "post";
          url = `/${name}/:${name}_id`;
          break;
        case "create":
          method = "post";
          url = `/${name}`;
          break;
        case "index":
          method = "get";
          url = "/";
          break;
        default:
          /* istanbul ignore next */
          throw new Error(`unrecognized route: ${name}.${key}`);
      }

      // setup
      handler = obj[key];
      url = prefix + url;

      // before middleware support
      if (obj.before) {
        (app as any)[method](url, obj.before, handler);
      } else {
        (app as any)[method](url, handler);
      }
    }

    // mount the app
    parent.use(app);
  }
}
