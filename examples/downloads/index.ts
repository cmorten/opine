import { dirname, join } from "https://deno.land/std/path/mod.ts";
import opine from "../../mod.ts";

const app = opine();
const __dirname = dirname(import.meta.url);

app.get("/", function (_req, res) {
  res.send(
    "<ul>" +
      '<li>Download <a href="/files/amazing.txt">amazing.txt</a>.</li>' +
      '<li>Download <a href="/files/missing.txt">missing.txt</a>.</li>' +
      '<li>Download <a href="/files/CCTV大赛上海分赛区.txt">CCTV大赛上海分赛区.txt</a>.</li>' +
      "</ul>",
  );
});

app.get("/files/:file(*)", async function (req, res, next) {
  const filePath = join(__dirname, "files", req.params.file);

  try {
    await res.download(filePath);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      res.status = 404;
      res.send("Cant find that file, sorry!");

      return;
    }

    return next(err);
  }
});

app.listen({ port: 3000 });
console.log("Opine started on port 3000");
