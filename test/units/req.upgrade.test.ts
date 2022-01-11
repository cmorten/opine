import { opine } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".upgrade", function () {
    it("should upgrade websocket requests", function (done) {
      let serverSocket: WebSocket;

      const handleSocket = (socket: WebSocket) => {
        serverSocket = socket;

        socket.addEventListener("open", () => {
          console.log("[server]: ping");
          socket.send("ping");
        });

        socket.addEventListener("message", (e) => {
          if (e.data === "ping") {
            console.log("[server]: pong");
            socket.send("pong");
          }
        });
      };

      const app = opine();

      app.get("/ws", function (req, _res, _next) {
        if (req.headers.get("upgrade") === "websocket") {
          const socket = req.upgrade();
          expect(socket).toBeInstanceOf(WebSocket);
          handleSocket(socket);
        }
      });

      const server = app.listen(3000);

      const socket = new WebSocket("ws://localhost:3000/ws");

      socket.addEventListener("open", () => {
        console.log("[client]: ping");
        socket.send("ping");
      });

      socket.addEventListener("message", (e) => {
        if (e.data === "ping") {
          console.log("[client]: pong");
          socket.send("pong");
        } else if (e.data === "pong") {
          socket.close();
          serverSocket.close();
          server.close();

          done();
        } else {
          done(new Error("unexpected message"));
        }
      });

      socket.addEventListener("error", (e) => {
        done(e);
      });
    });
  });
});
