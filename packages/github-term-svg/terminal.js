import { render } from "svg-term";
import { cached } from "@tarun-sri-sai/function-cache";

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

const exportSvg = async (events = [], rows) => {
  const asciicast = await exportAsciicast(events, rows);
  return render(asciicast, {
    theme: {
      background: [13, 17, 23],
      text: [240, 246, 252],
      cursor: [240, 246, 252],
    },
  });
};

export const exportSvgCached = cached(exportSvg);
