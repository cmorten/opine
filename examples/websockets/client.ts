console.log("Client started");
const socket = new WebSocket("ws://localhost:3000/ws");

socket.addEventListener("open", () => {
  socket.send("ping");
  console.log("sent ping to server");
});

socket.addEventListener("close", (_) => {
  console.log("socket closed :(");
});

socket.addEventListener("message", (e) => {
  if (e.data === "ping") {
    console.log("Received ping from server. Responding...");
    socket.send("pong");
  } else if (e.data === "pong") {
    console.log("Received ping response from server.");
  }
});

socket.addEventListener("error", (e) => {
  console.error(`Had error`, e);
});
