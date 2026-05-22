const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");
const { cached } = require("./cache");

const exportGif = async (lines = []) => {
  return new Promise((resolve, reject) => {
    if (!lines.length) {
      lines = [""];
    }

    const config = {
      cols: 80,

      fontSize: 16,
      fontFamily: "Menlo, Monaco, Consolas, monospace",
      fontWeight: "400",

      lineHeight: 1.5,

      padding: 16,
      terminalPadding: 20,

      bg: "#0d1117",
      terminalBg: "#161b22",

      textColor: "#7ee787",
      cursorColor: "#7ee787",

      frameDelay: 60,
      quality: 10,

      framesPerChar: 2,
    };

    const measureCanvas = createCanvas(1, 1);
    const measureCtx = measureCanvas.getContext("2d");

    measureCtx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;

    measureCtx.textBaseline = "alphabetic";

    const metrics = measureCtx.measureText("M");

    const charWidth = metrics.width;

    const ascent = metrics.actualBoundingBoxAscent || config.fontSize * 0.8;

    const descent = metrics.actualBoundingBoxDescent || config.fontSize * 0.2;

    const textHeight = ascent + descent;

    const lineHeight = Math.round(config.fontSize * config.lineHeight);

    const rows = lines.length;

    const innerWidth =
      Math.ceil(charWidth * config.cols) + config.terminalPadding * 2;

    const innerHeight = lineHeight * rows + config.terminalPadding * 2;

    const width = innerWidth + config.padding * 2;

    const height = innerHeight + config.padding * 2;

    const encoder = new GIFEncoder(width, height);

    const chunks = [];
    const stream = encoder.createReadStream();

    stream.on("data", (chunk) => chunks.push(chunk));

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", reject);

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(config.frameDelay);
    encoder.setQuality(config.quality);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;

    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";

    let currentLine = 0;
    let currentChar = 0;

    const firstLineChars = (lines[0]?.length || 0);
    const processingDelay = 20; // frames to simulate processing
    const firstLineFrames = firstLineChars * config.framesPerChar;
    const totalFrames = firstLineFrames + processingDelay + 40;

    for (let frame = 0; frame < totalFrames; frame++) {
      ctx.fillStyle = config.bg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = config.terminalBg;
      ctx.fillRect(config.padding, config.padding, innerWidth, innerHeight);

      ctx.fillStyle = config.textColor;

      const startX = config.padding + config.terminalPadding;

      const startY = config.padding + config.terminalPadding + ascent;


      const firstLineAnimationComplete = frame >= firstLineFrames + processingDelay;
      if (firstLineAnimationComplete) {
        for (let i = 0; i < lines.length; i++) {
          const y = startY + i * lineHeight;
          ctx.fillText(lines[i], startX, y);
        }
      } else if (frame < firstLineFrames) {
        const current = lines[0]?.slice(0, currentChar) || "";
        const currentY = startY;
        ctx.fillText(current, startX, currentY);

        const cursorVisible = Math.floor(frame / 6) % 2 === 0;

        if (cursorVisible) {
          const cursorX = startX + ctx.measureText(current).width;
          const cursorWidth = Math.max(2, Math.round(charWidth * 0.12));
          ctx.fillStyle = config.cursorColor;

          ctx.fillRect(
            Math.round(cursorX + 1),
            Math.round(currentY - ascent),
            cursorWidth,
            Math.round(textHeight),
          );
        }

        if (frame % config.framesPerChar === 0) {
          currentChar++;
          if (currentChar > firstLineChars) {
            currentChar = firstLineChars;
          }
        }
      } else {
        const firstLineY = startY;
        ctx.fillText(lines[0], startX, firstLineY);
      }

      encoder.addFrame(ctx);
    }

    encoder.finish();
  });
};

module.exports = {
  exportGif: cached(exportGif),
};
