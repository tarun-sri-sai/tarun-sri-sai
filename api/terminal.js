const { cached } = require("./cache");
const fs = require("fs/promises");
const { execSync, execFile } = require("child_process");
const { promisify } = require("util");
const { file } = require("tmp-promise");

const execFileAsync = promisify(execFile);

const exportAsciicast = async (events, rows = 12) => {
  const records = [];
  let t = 0;

  for (const event of events) {
    switch (event.type) {
      case "type":
        for (const ch of event.text) {
          records.push([t, "o", ch]);
          t += 0.05;
        }
        break;

      case "output":
        records.push([t, "o", event.text]);
        break;

      case "wait":
        t += event.ms / 1000;
        break;

      case "clear":
        records.push([t, "o", "\x1b[2J\x1b[H"]);
        break;
    }
  }

  return [
    JSON.stringify({
      version: 2,
      width: 80,
      height: rows,
      timestamp: Math.floor(Date.now() / 1000),
    }),
    ...records.map(JSON.stringify),
  ].join("\n");
};

const castToSvg = async (cast) => {
  const castFile = await file({ postfix: ".cast" });
  const svgFile = await file({ postfix: ".svg" });

  try {
    await fs.writeFile(castFile.path, cast);

    const svgArgs = [
      "svg-term",
      "--in",
      castFile.path,
      "--out",
      svgFile.path,
      "--window",
      "--no-cursor",
    ];

    const win32Args = ["cmd", ["/c", "npx", ...svgArgs]];
    const nonWin32Args = ["npx", svgArgs];

    await execFileAsync(
      ...(process.platform === "win32" ? win32Args : nonWin32Args),
    );

    return await fs.readFile(svgFile.path, "utf8");
  } finally {
    await Promise.allSettled([castFile.cleanup(), svgFile.cleanup()]);
  }
};

const exportSvg = async (events = [], rows) => {
  const asciicast = await exportAsciicast(events, rows);
  return await castToSvg(asciicast);
};

module.exports = {
  exportSvg: cached(exportSvg),
};
