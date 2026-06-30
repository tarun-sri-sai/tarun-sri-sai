const Keyv = require("keyv").default;
const KeyvRedis = require("@keyv/redis").default;
const zlib = require("zlib");
const crypto = require("crypto");
const stringify = require("fast-json-stable-stringify");
const { Duration } = require("luxon");
const { promisify } = require("util");

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const CACHE_TTL = Duration.fromObject({ days: 1 });

const cache = new Keyv({
  store: new KeyvRedis(process.env.FUNC_CACHE_REDIS_URL),
  ttl: CACHE_TTL.as("milliseconds"),
});

cache.on("error", (err) => console.error(`keyv error: ${err}`));

const cached = (fn, { ttl } = {}) => {
  return async (...args) => {
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

module.exports = {
  cached,
};
