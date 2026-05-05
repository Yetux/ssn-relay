const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("StreamElements widget connected");

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

function broadcast(data) {
  const payload = JSON.stringify(data);

  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

app.post("/ssn", (req, res) => {
  console.log("SSN message:", req.body);

  broadcast({
    name: req.body.chatname || req.body.name || "Unknown",
    message: req.body.chatmessage || req.body.message || "",
    platform: (req.body.type || req.body.platform || "chat").toLowerCase(),
    avatar: req.body.chatimg || "",
    color: req.body.nameColor || ""
  });

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("SSN relay is running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Relay running on port ${PORT}`);
});
