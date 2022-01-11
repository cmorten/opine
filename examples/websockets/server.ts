/**
 * Run this example using:
 *
 *    deno run --allow-read --allow-net ./examples/websockets/server.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-read --allow-net https://raw.githubusercontent.com/cmorten/opine/main/examples/websockets/server.ts
 *
 *    if you don't!
 *
 * After running the example, run the client with:
 *
 *    deno run --allow-net ./examples/websockets/client.ts
 *
 *    (OR)
 *
 *    deno run --allow-net https://raw.githubusercontent.com/cmorten/opine/main/examples/websockets/server.ts
 */

import { opine } from "../../mod.ts";

const app = opine();
const sockets = new Map<string, WebSocket>();

const handleWs = async (socket: WebSocket) => {
  sockets.set(crypto.randomUUID(), socket);
  socket.addEventListener("open", (e) => {
    socket.send("ping");
    console.log("sent ping to client");
  });
  socket.addEventListener("close", (_) => {
    console.log("socket closed :(");
  });

  socket.addEventListener("message", (e) => {
    if (e.data === "ping") {
      console.log("Received ping from client. Responding...");
      socket.send("pong");
    } else if (e.data === "pong") {
      console.log("Received ping response from client.");
    }
  });
};

app.get("/ws", async (req, res, next) => {
  if (req.headers.get("upgrade") === "websocket") {
    const sock = req.upgrade(res);
    await handleWs(sock);
  } else {
    res.send("You've gotta set the magic header...");
  }

  next();
});

app.use((_, res, __) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader(
    "access-control-expose-headers",
    "Upgrade,sec-websocket-accept,connection",
  );

  res.send();
});

app.listen(3000, () => {
  console.log("Opine listening on port 3000.");
});
