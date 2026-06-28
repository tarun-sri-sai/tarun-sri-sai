import { CACHE_TTL } from "@tarun-sri-sai/github-term-svg";

export const getSvgHeaders = (bufferLength) => ({
  "Content-Type": "image/svg+xml",
  "Cache-Control": `max-age=${CACHE_TTL.as("seconds")}`,
  "Content-Length": bufferLength.toString(),
});
