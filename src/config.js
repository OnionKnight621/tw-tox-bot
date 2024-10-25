const channels = [process.env.CHANNEL];

exports.admins = ["onionknight621"];

exports.channels = channels;

exports.llamaConfig = {
  model: "llama3.1",
  localLlamaApi: "http://localhost:11434/api/",
  llamaApiOptions: {
    generate: "generate/",
    translate: "translate/",
    completion: "completion/",
  },
};

exports.tmiConfig = {
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: "onlonknight621",
    password: process.env.TWITCH_OAUTH_TOKEN || "test",
  },
  channels,
};
