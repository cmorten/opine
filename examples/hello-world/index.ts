import opine from "../../mod.ts";

const app = opine();

app.get("/", function (_req, res) {
  res.send("Hello World");
});

app.listen({ port: 3000 });
console.log("Opine started on port 3000");
