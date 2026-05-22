const express = require("express");
const {
  getCommitsLastYearText,
  getTopLanguagesText,
  getTopRepositoriesText,
} = require("./github/text");
const { exportGif } = require("./terminal");
const { CACHE_TTL } = require("./cache");
const serverless = require("serverless-http");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const getGifHeaders = (bufferLength) => ({
  "Content-Type": "image/gif",
  "Cache-Control": `max-age=${CACHE_TTL.as("seconds")}`,
  "Content-Length": bufferLength,
});

app.get("/api/commits-last-year", async (req, res) => {
  try {
    const text = await getCommitsLastYearText();
    const buffer = await exportGif(text);
    res.set(getGifHeaders(buffer.length));
    res.send(buffer);
  } catch (error) {
    console.error("error fetching commits:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/top-languages", async (req, res) => {
  try {
    const text = await getTopLanguagesText();
    const buffer = await exportGif(text);
    res.set(getGifHeaders(buffer.length));
    res.send(buffer);
  } catch (error) {
    console.error("error fetching languages:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/top-repos", async (req, res) => {
  try {
    const text = await getTopRepositoriesText();
    const buffer = await exportGif(text);
    res.set(getGifHeaders(buffer.length));
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

module.exports = serverless(app);
