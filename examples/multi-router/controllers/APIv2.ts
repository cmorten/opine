import { Router } from "../../../mod.ts";
import { Router as IRouter } from "../../../typings/index.d.ts";

const APIv2: IRouter = Router();

APIv2.get("/", function (_req, res) {
  res.send("Hello from APIv2 root route.");
});

APIv2.get("/users", function (_req, res) {
  res.send("List of APIv2 users.");
});

export default APIv2;
