import "dotenv/config";
import express from "express";
import { runJob } from "./run-order.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.send("predictive-order-bot online"));

app.post("/run", async (req, res) => {
  try {
    const report = await runJob(req.body || {});
    res.json({ ok: true, ...report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`HTTP server listening on :${port}`));
