console.log("Client started");
const socket = new WebSocket("ws://localhost:3000/ws");

socket.addEventListener("open", (e) => {
  socket.send("ping");
});

socket.addEventListener("close", (_) => {
  console.log("socket closed :(");
});

socket.addEventListener("message", (e) => {
  console.log(`Received msg "${e.data}" from server.`);
  if (e.data === "ping") {
    socket.send("pong");
  }
});

socket.addEventListener("error", (e) => {
  console.error(`Had error`, e);
});
