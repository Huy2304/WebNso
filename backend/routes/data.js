// routes/data.js
module.exports = (store) => {
    const express = require("express");
    const router = express.Router();

    // Nhận JSON từ J2ME
    router.post("/", (req, res) => {
        try {
            const data = req.body;
            if (!data || typeof data !== "object")
                return res.status(400).json({ error: "invalid payload" });

            data._receivedAt = new Date().toISOString();
            store.events.push(data);
            if (store.events.length > 2000) store.events.shift();

            res.json({ status: "ok" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "server error" });
        }
    });

    return router;
};
