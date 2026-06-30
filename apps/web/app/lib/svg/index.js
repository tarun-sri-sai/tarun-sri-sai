import { Duration } from "luxon";

export const getSvgHeaders = (bufferLength) => ({
  "Content-Type": "image/svg+xml",
  "Cache-Control": `max-age=${Duration.fromObject({ days: 1 }).as("seconds")}`,
  "Content-Length": bufferLength.toString(),
});
