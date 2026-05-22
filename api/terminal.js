const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");
const { cached } = require("./cache");

const exportGif = async (lines = []) => {
  return new Promise((resolve, reject) => {
    if (lines.length === 0) {
      lines = [""];
    }

    const width = 900;
    const height = 500;
    const encoder = new GIFEncoder(width, height);

    const chunks = [];
    const stream = encoder.createReadStream();

    stream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", reject);

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(45);
    encoder.setQuality(10);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    let currentLine = 0;
    let currentChar = 0;

    const totalFrames = lines.join("").length * 3 + 80;

    for (let frame = 0; frame < totalFrames; frame++) {
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#161b22";
      ctx.fillRect(20, 20, width - 40, height - 40);

      ctx.fillStyle = "#7ee787";
      ctx.font = "28px monospace";

      let y = 90;

      for (let i = 0; i < currentLine; i++) {
        ctx.fillText(lines[i], 50, y);
        y += 50;
      }

      const current = lines[currentLine]?.slice(0, currentChar) || "";

      ctx.fillText(current, 50, y);

      const cursorVisible = Math.floor(frame / 6) % 2 === 0;

      if (cursorVisible) {
        const cursorX = 50 + ctx.measureText(current).width + 5;

        ctx.fillRect(cursorX, y - 24, 12, 28);
      }

      currentChar++;

      if (currentChar > (lines[currentLine]?.length || 0)) {
        currentLine++;
        currentChar = 0;
      }

      if (currentLine >= lines.length) {
        currentLine = lines.length - 1;
        currentChar = lines[currentLine].length;
      }

      encoder.addFrame(ctx);
    }

    encoder.finish();
  });
};

module.exports = {
  exportGif: cached(exportGif),
};
