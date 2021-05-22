import { Router } from "../../../mod.ts";

const APIv1 = Router();

APIv1.get("/", function (_req, res) {
  res.send("Hello from APIv1 root route.");
});

APIv1.get("/users", function (_req, res) {
  res.send("List of APIv1 users.");
});

export default APIv1;
