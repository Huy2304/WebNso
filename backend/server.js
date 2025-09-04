const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();

// ====== CORS Config ======
const allowedOrigins = [
    "https://webnso.vercel.app",
    "https://toolnso.click",
    "https://www.toolnso.click", // thêm luôn www
    "http://localhost:5173",     // để dev test
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// ====== Store & Queue ======
const store = { events: [] };
const cmdQueues = new Map();

function q(clientId) {
    if (!cmdQueues.has(clientId)) cmdQueues.set(clientId, []);
    return cmdQueues.get(clientId);
}

// ====== Routes ======
app.get("/", (req, res) => res.send("✅ Server is running!"));

// Register client
app.get("/api/register", (req, res) => {
    const clientId = req.query.clientId;
    if (!clientId) return res.status(400).json({ error: "clientId required" });

    q(clientId); // khởi tạo queue rỗng
    res.json({ clientId });
});

// Login API
app.post("/api/login", (req, res) => {
    const { username, password, clientId } = req.body || {};
    if (!clientId) return res.status(400).json({ error: "clientId required" });

    const exePath = path.join(__dirname, "AngelChipEmulator.exe");
    const jarPath = path.join(__dirname, "MobileApplication1.jar");
    const midletClass = "GameMidlet";

    const child = spawn("java", ["-cp", `${exePath};${jarPath}`, "org.microemu.app.Main", midletClass]);

    child.stdout.on("data", (data) => console.log("OUT:", data.toString()));
    child.stderr.on("data", (err) => console.error("ERR:", err.toString()));
    child.on("close", (code) => console.log("Game closed:", code));

    res.json({ status: "started", clientId });
});

// Gửi command
app.post("/api/command", (req, res) => {
    const { clientId, action, params } = req.body || {};
    if (!clientId || !action) return res.status(400).json({ error: "clientId & action required" });

    const cmd = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        action,
        params: params || {}
    };

    q(clientId).push(cmd);
    io.emit("cmdQueued", { clientId, cmd });

    console.log("Queue:", cmdQueues);

    res.json({ status: "queued", id: cmd.id });
});

// Polling command
app.get("/api/command/next", (req, res) => {
    const clientId = req.query.clientId;
    if (!clientId) return res.status(400).json({ error: "clientId required" });

    const queue = q(clientId);
    if (queue.length === 0) return res.status(204).end();
    res.json(queue.shift());
});

// Nhận data từ J2ME
app.post("/api/data", (req, res) => {
    const data = req.body;
    if (!data.clientId) return res.status(400).json({ error: "no clientId" });

    store.events.push(data);
    io.emit("newData", data);
    res.json({ status: "ok" });
});

// Health check
app.get("/health", (req, res) => res.send("oke"));

// ====== Socket.IO ======
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("FE connected:", socket.id);
    socket.on("disconnect", (reason) => {
        console.log("FE disconnected:", socket.id, "Reason:", reason);
    });
});

// ====== Start Server ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server listening on port", PORT));
