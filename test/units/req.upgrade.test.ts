import { opine } from "../../mod.ts";
import { deferred, expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".upgrade", function () {
    it("should upgrade websocket requests", function (done) {
      let serverSocket: WebSocket;

      const serverSocketClosedDeferred = deferred();
      const clientSocketClosedDeferred = deferred();

      const handleSocket = (socket: WebSocket) => {
        serverSocket = socket;

        serverSocket.addEventListener("close", () => {
          serverSocketClosedDeferred.resolve();
        });

        serverSocket.addEventListener("open", () => {
          console.log("[server]: ping");
          serverSocket.send("ping");
        });

        serverSocket.addEventListener("message", (e) => {
          if (e.data === "ping") {
            console.log("[server]: pong");
            serverSocket.send("pong");
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

      socket.addEventListener("close", () => {
        clientSocketClosedDeferred.resolve();
      });

      socket.addEventListener("open", () => {
        console.log("[client]: ping");
        socket.send("ping");
      });

      socket.addEventListener("message", async (e) => {
        if (e.data === "ping") {
          console.log("[client]: pong");
          socket.send("pong");
        } else if (e.data === "pong") {
          socket.close();
          serverSocket.close();
          server.close();

          await serverSocketClosedDeferred;
          await clientSocketClosedDeferred;

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
