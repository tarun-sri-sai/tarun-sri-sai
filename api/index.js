const express = require("express");
const {
  getCommitsLastYearEvents,
  getTopLanguagesEvents,
  getTopRepositoriesEvents,
} = require("./github/events");
const { exportSvg } = require("./terminal");
const { CACHE_TTL } = require("./cache");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const getSvgHeaders = (bufferLength) => ({
  "Content-Type": "image/svg+xml",
  "Cache-Control": `max-age=${CACHE_TTL.as("seconds")}`,
  "Content-Length": bufferLength,
});

app.get("/api/commits-last-year", async (req, res) => {
  try {
    const { events, rows } = await getCommitsLastYearEvents();
    const buffer = await exportSvg(events, rows);
    res.set(getSvgHeaders(buffer.length));
    res.send(buffer);
  } catch (error) {
    console.error("error fetching commits:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/top-languages", async (req, res) => {
  try {
    const { events, rows } = await getTopLanguagesEvents();
    const buffer = await exportSvg(events, rows);
    res.send(buffer);
  } catch (error) {
    console.error("error fetching languages:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/top-repos", async (req, res) => {
  try {
    const { events, rows } = await getTopRepositoriesEvents();
    const buffer = await exportSvg(events, rows);
    res.send(buffer);
  } catch (error) {
    console.error("error fetching repositories:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "GitHub Stats API",
    endpoints: {
      health: "/api/health",
      commits: "/api/commits-last-year",
      languages: "/api/top-languages",
      repositories: "/api/top-repos",
    },
  });
});

app
  .listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  })
  .on("error", (e) => {
    console.error(`server crashed with error: ${e}`);
  });
