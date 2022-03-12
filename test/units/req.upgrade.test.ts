import { opine } from "../../mod.ts";
import { deferred, expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".upgrade", function () {
    it("should upgrade websocket requests", async function (done) {
      let serverSocket: WebSocket;

      const clientSocketClosedDeferred = deferred();
      const clientSocketPingedDeferred = deferred();
      const clientSocketPongedDeferred = deferred();
      const serverSocketClosedDeferred = deferred();
      const serverSocketPingedDeferred = deferred();
      const serverSocketPongedDeferred = deferred();

      const handleSocket = (socket: WebSocket) => {
        serverSocket = socket;

        serverSocket.addEventListener("close", () => {
          serverSocketClosedDeferred.resolve();
        });

        serverSocket.addEventListener("open", () => {
          console.log("[server]: ping");
          serverSocket.send("ping");
          serverSocketPingedDeferred.resolve();
        });

        serverSocket.addEventListener("message", (e) => {
          if (e.data === "ping") {
            console.log("[server]: pong");
            serverSocket.send("pong");
            serverSocketPongedDeferred.resolve();
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

      const clientSocket = new WebSocket("ws://localhost:3000/ws");

      clientSocket.addEventListener("close", () => {
        clientSocketClosedDeferred.resolve();
      });

      clientSocket.addEventListener("open", () => {
        console.log("[client]: ping");
        clientSocket.send("ping");
        clientSocketPingedDeferred.resolve();
      });

      clientSocket.addEventListener("message", (e) => {
        if (e.data === "ping") {
          console.log("[client]: pong");
          clientSocket.send("pong");
          clientSocketPongedDeferred.resolve();
        } else if (e.data === "pong") {
          server.close();
          clientSocket.close();
          serverSocket.close();
        } else {
          done(new Error("unexpected message"));
        }
      });

      clientSocket.addEventListener("error", (e) => {
        done(e);
      });

      await Promise.all([
        clientSocketPingedDeferred,
        clientSocketPongedDeferred,
        serverSocketPingedDeferred,
        serverSocketPongedDeferred,
        serverSocketClosedDeferred,
        clientSocketClosedDeferred,
      ]);

      done();
    });
  });
});
