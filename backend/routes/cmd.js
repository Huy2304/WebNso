// routes/cmd.js
module.exports = (q) => {
    const express = require("express");
    const router = express.Router();

    // J2ME → lấy lệnh tiếp theo
    router.get("/next", (req, res) => {
        const clientId = req.query.clientId;
        if (!clientId) return res.status(400).json({ error: "clientId required" });

        const queue = q(clientId);
        if (queue.length === 0) return res.status(204).end();

        const next = queue.shift();
        res.json(next);
    });

    // FE → enqueue command
    router.post("/enqueue", (req, res) => {
        const { clientId, action, params } = req.body || {};
        if (!clientId || !action)
            return res.status(400).json({ error: "clientId & action required" });

        const cmd = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            action,
            params: params || {},
        };
        q(clientId).push(cmd);

        res.json({ status: "queued", id: cmd.id });
    });

    return router;
};
