const { llamaConfig } = require("./config");

const { llamaApiOptions, localLlamaApi } = llamaConfig;

async function parseLlamaApiResponse(response) {
  const text = await response.text();

  let jsonStrings = text.trim().split("\n");
  let jsonArray = jsonStrings.map(jsonStr => JSON.parse(jsonStr));
  let fullResponse = jsonArray.map(obj => obj.response).join("");

  return fullResponse;
}

async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ prompt: options.prompt, model: options.model }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out after 5 seconds");
    }
    throw error;
  }
}

async function useLlamaApi(options) {
  try {
    const { method, prompt = "", model = llamaConfig.model } = options;
    const url = `${localLlamaApi}${
      llamaApiOptions[method] || llamaApiOptions.generate
    }`;

    const message = `
      Analyze the message and respond with a number from 0 to 6, based on its toxicity level:
      0 - Not Toxic: Neutral or positive language.
      1 - Slightly Offensive: Mildly inappropriate comments.
      2 - Borderline Toxic: Slightly disrespectful or sarcastic.
      3 - Mildly Toxic: Subtle insults or dismissive language.
      4 - Moderately Toxic: Clear insults or harmful language.
      5 - Highly Toxic: Strongly offensive or aggressive language.
      6 - Extremely Toxic: Severe threats or explicit abuse.

      Message: [${prompt}]

      Respond with a number only. No additional text is allowed.
    `;

    // console.log("message: ", message);

    const response = await fetchWithTimeout(url, {
      prompt: message,
      model,
    });

    const json = await parseLlamaApiResponse(response);

    return json;
  } catch (error) {
    console.log(error);
    throw new Error("Error in Llama API: ", error);
  }
}

function findFirstNumberInString(str) {
  const regex = /\d+/;
  const match = str.match(regex);

  return match ? parseInt(match[0]) : null;
}

module.exports = {
  useLlamaApi,
  findFirstNumberInString,
};
