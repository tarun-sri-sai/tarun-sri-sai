const GIFEncoder = require("gifencoder");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
const { cached } = require("./cache");
const { Terminal } = require("@xterm/headless");

GlobalFonts.registerFromPath(
  "./fonts/JetBrainsMonoNerdFont-Regular.ttf",
  "JetBrains Mono",
);

const config = {
  cols: 80,
  rows: 12,

  fontSize: 16,

  fontFamily: "JetBrains Mono",

  lineHeight: 1.5,

  theme: {
    background: "#0d1117",
    foreground: "#7ee787",
  },

  gif: {
    delay: 60,
    quality: 10,
  },

  cursorWidth: 0.8,
};

const createTerminal = () => {
  return new Terminal({
    cols: config.cols,
    rows: config.rows,
    cursorBlink: true,
    theme: config.theme,
    allowProposedApi: true,
  });
};

const playEvent = async (event, terminal, onFrame) => {
  switch (event.type) {
    case "type": {
      for (const char of event.text) {
        await new Promise((resolve) => {
          terminal.write(char, resolve);
        });
        await onFrame(true);
      }
      break;
    }

    case "output": {
      await new Promise((resolve) => {
        terminal.write(event.text, resolve);
      });
      await onFrame();
      break;
    }

    case "wait": {
      const frames = Math.floor(event.ms / config.gif.delay);
      for (let i = 0; i < frames; i++) {
        await onFrame();
      }
      break;
    }

    case "clear": {
      terminal.clear();
      await onFrame();
      break;
    }
  }
};

const playEvents = async ({ terminal, events, onFrame }) => {
  for (const event of events) {
    await playEvent(event, terminal, onFrame);
  }
};

const getDimensions = () => {
  const measureCanvas = createCanvas(1, 1);
  const measureCtx = measureCanvas.getContext("2d");
  measureCtx.font = `${config.fontSize}px ${config.fontFamily}`;

  const metrics = measureCtx.measureText("M");
  return metrics;
};

const renderCursor = (ctx, x, y, cellWidth, typing) => {
  ctx.fillStyle = config.theme.foreground;
  ctx.fillRect(
    (x * (1 - (1 - config.cursorWidth) / 2) + +typing) * cellWidth,
    config.fontSize * (y * config.lineHeight + (config.lineHeight - 1)),
    cellWidth * config.cursorWidth,
    config.fontSize
  );
};

const createRenderer = ({ terminal }) => {
  const { width: cellWidth } = getDimensions();

  const width = cellWidth * config.cols;
  const height = config.lineHeight * config.fontSize * config.rows;
  const canvas = createCanvas(width, height);

  const ctx = canvas.getContext("2d");
  ctx.font = `${config.fontSize}px ${config.fontFamily}`;
  ctx.textBaseline = "top";

  const render = (frames, typing = false) => {
    ctx.fillStyle = config.theme.background;
    ctx.fillRect(0, 0, width, height);

    const buffer = terminal.buffer.active;
    for (let y = 0; y < config.rows; y++) {
      const line = buffer.getLine(y);
      if (!line) {
        continue;
      }

      for (let x = 0; x < config.cols; x++) {
        const cell = line.getCell(x);
        if (!cell) {
          continue;
        }

        const char = cell.getChars();
        ctx.fillStyle = config.theme.foreground;
        ctx.fillText(
          char,
          x * cellWidth,
          config.fontSize * (y * config.lineHeight + (config.lineHeight - 1)),
        );
      }
    }

    if (frames % 16 < 8) {
      renderCursor(ctx, buffer.cursorX, buffer.cursorY, cellWidth, typing);
    }

    return ctx;
  };

  return {
    width,
    height,
    render,
  };
};

const createEncoder = ({ width, height }) => {
  const encoder = new GIFEncoder(width, height);
  const chunks = [];
  const stream = encoder.createReadStream();

  stream.on("data", (chunk) => {
    chunks.push(chunk);
  });

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(config.gif.delay);
  encoder.setQuality(config.gif.quality);

  return {
    encoder,

    finish: () =>
      new Promise((resolve) => {
        stream.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        encoder.finish();
      }),
  };
};

const exportGif = async (events = []) => {
  const terminal = createTerminal();
  const renderer = createRenderer({ terminal });
  const { encoder, finish } = createEncoder({
    width: renderer.width,
    height: renderer.height,
  });

  let frames = 0;
  await playEvents({
    terminal,
    events,
    onFrame: async (typing) => {
      frames++;
      const ctx = renderer.render(frames, typing);
      encoder.addFrame(ctx);
    },
  });

  return finish();
};

module.exports = {
  exportGif: cached(exportGif),
};
