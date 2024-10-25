require("dotenv").config();

const tmi = require("tmi.js");

const { tmiConfig, channels } = require("./config");
// const { initializeRedis } = require("./redisController");
const { useLlamaApi, findFirstNumberInString } = require("./utils");

console.log("Starting...");

const client = new tmi.Client(tmiConfig);

(async () => {
  try {
    await client.connect();
    // await initializeRedis();

    channels.forEach((channel) => {
      client.say(channel, "Запуск чі шо...");
    });

    client.on("message", async (channel, tags, msg, self) => {
      console.log("\x1b[36m%s\x1b[0m", `${tags["display-name"]}:`, `${msg}`);
      if (self) return;

      if (/(dota|дота|доту)/i.test(msg)) {
        return client.say(channel, `@${tags.username}, за доту в чаті блискавичний бан видаєтсья ( ͡° ͜ʖ ͡°)`);;
      };

      const response = await useLlamaApi({ prompt: msg });

      console.log("response: ", response);

      const result = findFirstNumberInString(response)

      console.log("result: ", result);

      if (result > 4) {
        return client.say(channel, `@${tags.username}, зараз буде бан`);
      }
      if (result > 2) {
        return client.say(channel, `@${tags.username}, слідкуйте за своїми словами`);
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
