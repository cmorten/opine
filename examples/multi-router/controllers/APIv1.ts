import { Router } from "../../../mod.ts";
import { Router as IRouter } from "../../../typings/index.d.ts";

const APIv1: IRouter = Router();

APIv1.get("/", function (_req, res) {
  res.send("Hello from APIv1 root route.");
});

APIv1.get("/users", function (_req, res) {
  res.send("List of APIv1 users.");
});

export default APIv1;
