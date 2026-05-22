const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 604800 });

const cached = (fn) => {
  return async (...args) => {
    const key = `${fn.name}:${args.join(":")}`;

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
};
