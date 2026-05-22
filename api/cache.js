const NodeCache = require("node-cache");
const crypto = require("crypto");
const stringify = require("fast-json-stable-stringify");
const { Duration } = require("luxon");

const CACHE_TTL = Duration.fromObject({ days: 7 });

const cache = new NodeCache({ stdTTL: CACHE_TTL.as("seconds") });

const cached = (fn) => {
  return async (...args) => {
    const key = crypto
      .createHash("sha256")
      .update(`${fn.name}:${stringify(args)}`)
      .digest("hex");

    const cachedValue = cache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
};

module.exports = {
  cached,
  CACHE_TTL,
};
