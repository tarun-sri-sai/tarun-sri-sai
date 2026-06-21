const Keyv = require("keyv").default;
const KeyvRedis = require("@keyv/redis").default;
const KeyvGzip = require("@keyv/compress-gzip").default;
const crypto = require("crypto");
const stringify = require("fast-json-stable-stringify");
const { Duration } = require("luxon");

const CACHE_TTL = Duration.fromObject({ days: 7 });

const cache = new Keyv({
  store: new KeyvRedis(process.env.REDIS_URL),
  ttl: CACHE_TTL.as("milliseconds"),
  compression: new KeyvGzip(),
});

const cached = (fn) => {
  return async (...args) => {
    const key = crypto
      .createHash("sha256")
      .update(`${fn.name}:${stringify(args)}`)
      .digest("hex");

    const cachedValue = await cache.get(key);
    if (cachedValue !== undefined) {
      return JSON.parse(cachedValue);
    }

    const result = await fn(...args);
    await cache.set(key, JSON.stringify(result));
    return result;
  };
};

module.exports = {
  cached,
  CACHE_TTL,
};
