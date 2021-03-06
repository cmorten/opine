/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read --unstable ./examples/react/server.tsx
 *
 * if have the repo cloned locally. Unfortunately template rendering does not
 * currently support remote URLs for views, so this example cannot be run directly
 * from this repo.
 *
 */
import { opine, serveStatic } from "https://deno.land/x/opine@1.2.0/mod.ts";
import { dirname, join } from "https://deno.land/x/opine@1.2.0/deps.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/4a50660/react/v16.13.1/react.d.ts"
import React from "https://dev.jspm.io/react@16.13.1";
import ReactDOMServer from "https://dev.jspm.io/react-dom@16.13.1/server";
import { App } from "./components/App.tsx";

/**
 * Create our client bundle - you could split this out into
 * a preprocessing step.
 */
const { diagnostics, files } = await Deno.emit(
  "./examples/react/client.tsx",
  {
    bundle: "esm",
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
    },
  },
);

if (diagnostics) {
  console.log(diagnostics);
}

/**
 * Create our Opine server.
 */
const app = opine();
const __dirname = dirname(import.meta.url);

// Register ejs as .html.
app.engine(".html", renderFileToString);

// Optional since opine defaults to CWD/views
app.set("views", join(__dirname, "views"));

// Path to our public directory
app.use(serveStatic(join(__dirname, "public")));

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('main.html').
app.set("view engine", "html");

/**
 * Implement the "doggos" API. In your apps you may wish to use
 * a MVC pattern. See examples such as "multi-router" for how you
 * can split your code into separate controllers.
 */
app.use("/api/v1/doggos", (req, res) => {
  const count = parseInt(req.query.count);
  const doggos = [...new Array(count)].map((_, index) => ({
    id: index + 1,
    alt: "A cute doggo",
    src: `https://placedog.net/400/225?id=${index + 1}`,
  }));

  res.json(doggos);
});

/**
 * Serve our client JS bundle.
 */
app.get("/scripts/client.js", async (req, res) => {
  const js = files["deno:///bundle.js"];
  res.type("application/javascript").send(js);
});

/**
 * Main route setup
 */
app.get("/", (req, res) => {
  const app = <App isServer={true} />;
  const content = (ReactDOMServer as any).renderToString(app);
  const scripts = `<script type="module" src="/scripts/client.js"></script>`;

  res.set("cache-control", "no-store").render("main", {
    content,
    scripts,
    title: "React Example",
  });
});

app.listen(3000);
console.log("Opine started on port 3000");
