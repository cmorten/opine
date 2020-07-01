/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read --unstable ./examples/swagger/index.ts
 * 
 *    if have the repo cloned locally.
 * 
 */

import { opine } from "../../mod.ts";
import { swaggerDoc } from "https://deno.land/x/deno_swagger_doc@ce744e/mod.ts";
import { v1 } from "./controllers/v1.ts";

/**
 * Create our swagger definition object.
 */
const swaggerDefinition = {
  info: {
    title: "My Deno API", // Title (required)
    version: "1.0.0", // Version (required)
    description:
      "A basic example of how to integrate the deno-swagger-doc module with Opine.", // Description (optional)
  },
  host: `localhost:3000`, // Host (optional)
  basePath: "/", // Base path (optional)
};

const options = {
  swaggerDefinition,
  /**
   * Path to the API docs.
   * 
   * Note that this path is relative to the directory from
   * which the `deno run` command is executed, not the application itself. If
   * you make this mistake you will likely see a "file not found" error.
   */
  apis: [
    "./examples/swagger/index.ts",
    "./examples/swagger/controllers/v1.ts",
  ],
};

/**
 * Initialize swagger-jsdoc -> returns validated swagger spec in json format.
 */
const swaggerSpec = swaggerDoc(options);

/**
 * Now we create our Opine instance.
 */
const app = opine();

/**
 * Serve the swagger on the `/swagger` endpoint.
 */
app.get("/swagger", function (req, res) {
  res.json(swaggerSpec);
});

app.use("/api/v1", v1);

/**
 * @swagger
 * /:
 *   get:
 *     description: Returns the homepage.
 *     responses:
 *       200:
 *         description: OK
 */
app.use("/", function(req, res) {
  res.send("Homepage");
});

app.listen(3000, () => console.log("Opine started on port 3000"));
