import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import zlib from "zlib";
import crypto from "crypto";
import stringify from "fast-json-stable-stringify";
import { Duration } from "luxon";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

let cache;

const getCache = () => {
  if (cache) {
    return cache;
  }

  cache = new Keyv({
    store: new KeyvRedis(process.env.FUNC_CACHE_REDIS_URL),
    ttl: Duration.fromObject({ days: 1 }).as("milliseconds"),
  });

  cache.on("error", (err) =>
    console.error(`keyv initialization error: ${err}`),
  );

  return cache;
};

export const cached = (fn, { ttl } = {}) => {
  return async (...args) => {
    const cache = getCache();

    const key = crypto
      .createHash("sha256")
      .update(`${fn.name}:${stringify(args)}`)
      .digest("hex");

    const cachedValue = await cache.get(key);

    if (cachedValue !== undefined) {
      const extracted = await gunzip(cachedValue);
      return JSON.parse(extracted.toString("utf8"));
    }

    const result = await fn(...args);
    const compressed = await gzip(JSON.stringify(result));
    await cache.set(key, compressed, ttl);

    return result;
  };
};
