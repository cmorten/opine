import { Router } from "../../../mod.ts";

const v1 = Router();

/**
 * @swagger
 * /api/v1/:
 *   get:
 *     description: Returns a welcome message.
 *     responses:
 *       200:
 *         description: OK
 */
v1.get("/", function (req, res) {
  res.send("Hello Deno!");
});

/**
 * @swagger
 * /api/v1/users/:
 *   get:
 *     description: Returns the users as an array.
 *     responses:
 *       200:
 *         description: OK
 */
v1.get("/users", function (req, res) {
  res.json(["Deno", "SuperDeno", "SuperOak"]);
});

export { v1 };
