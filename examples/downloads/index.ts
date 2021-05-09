/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/downloads/index.ts
 * 
 *    after cloning the repo locally.
 * 
 */

import { dirname, join } from "../../deps.ts";
import opine from "../../mod.ts";

const app = opine();
const __dirname = dirname(import.meta.url);

app.get("/", function (req, res) {
  res.send(
    "<ul>" +
      '<li>Download <a href="/files/amazing.txt">amazing.txt</a>.</li>' +
      '<li>Download <a href="/files/missing.txt">missing.txt</a>.</li>' +
      '<li>Download <a href="/files/CCTV大赛上海分赛区.txt">CCTV大赛上海分赛区.txt</a>.</li>' +
      "</ul>",
  );
});

// If we used `/files/*`, the name could be accessed via req.params[0]
// but here we have named it using :file
app.get("/files/:file(*)", async function (req, res, next) {
  const filePath = join(__dirname, "files", req.params.file);

  try {
    await res.download(filePath);
  } catch (err) {
    // file for download not found
    if (err instanceof Deno.errors.NotFound) {
      res.status = 404;
      res.send("Cant find that file, sorry!");

      return;
    }

    // non-404 error
    return next(err);
  }
});

if (import.meta.main) {
  // You can call listen the same as Express with just
  // a port: `app.listen(3000)`, or with any arguments
  // that the Deno `http.serve` methods accept. Namely
  // an address string, HttpOptions or HttpsOptions
  // objects.
  app.listen({ port: 3000 });
  console.log("Opine started on port 3000");
}

export { app };
