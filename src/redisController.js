const { createClient } = require("redis");

let client;

async function initializeRedis() {
  try {
    client = createClient();

    client.on("error", (err) => {
      console.error("Redis connection error: ", err);
      createStubs();
    });

    await client.connect();

    client.on("connect", () => {
      console.log("Connected to Redis");
    });
  } catch (error) {
    console.error("Failed to initialize Redis client: ", error);
    createStubs();
  }
}

function createStubs() {
  client = {
    setEx: () => {},
    get: () => {},
    lPush: () => {},
    lRange: () => {},
    expire: () => {},
  };
}

async function saveToRedis(key, value, ttl = 60 * 60 * 24) {
  try {
    await client.set(key, JSON.stringify(value), "EX", ttl);
    console.log(`Data saved to Redis with key: ${key}`);
  } catch (error) {
    console.error(`Error saving data to Redis: ${error}`);
  }
}

async function pushMessageToRedisList(key, message, ttl = 60 * 60 * 24) {
  try {
    await client.lPush(key, JSON.stringify(message));
    await client.expire(key, ttl);

    console.log(`Message saved to Redis with key: ${key}`);
  } catch (error) {
    console.error(`Error saving message to Redis: ${error}`);
  }
}

async function getFromRedis(key) {
  try {
    const data = await client.get(key);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting data from Redis: ${error}`);
    return null;
  }
}

async function getRedisMessagesList(key) {
  try {
    const data = await client.lRange(key, 0, -1);
    return data.map((item) => JSON.parse(item));
  } catch (error) {
    console.error(`Error getting messages from Redis: ${error}`);
    return [];
  }
}

async function clearRedis() {
  try {
    await client.flushall("ASYNC");
    console.log("Redis cleared");
  } catch (error) {
    console.error("Error clearing Redis: ", error);
  }
}

module.exports = {
  saveToRedis,
  getFromRedis,
  pushMessageToRedisList,
  getRedisMessagesList,
  initializeRedis,
  clearRedis,
};
