/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/downloads/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/master/examples/downloads/index.ts
 * 
 *    if you don't!
 * 
 */

import { dirname, join } from "https://deno.land/std/path/mod.ts";
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

app.listen({ port: 3000 });
console.log("Opine started on port 3000");
