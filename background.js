import { API_TOKEN, OPENAI_TOKEN } from "./config.js";
// initializing the chrome storage local API
console.log("before installing key pairs");
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ key: value }, function () {
    console.log("Value is set to " + value);
  });
});

// const MODEL = "facebook/bart-large-cnn";
chrome.storage.local.set({ TESTKEY: "testKey" }, function () {
  console.log("Sthis is just a test,");
});
chrome.storage.local.get(["TESTKEY"], (data) => {
  console.log(data.TESTKEY);
});
localStorage.setItem("localstorage", "123");
chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  const currentTab = tabs[0];

  toggleLoader(true);
  displayInformation("", "");

  const tabInformation = await getTabInformation(currentTab);
  // const modelResult = await runModel(MODEL, tabInformation["textToSummarise"]);
  const summerizeResult = await summarizeText(
    tabInformation["textToSummarise"],
    OPENAI_TOKEN
  );

  toggleLoader(false);
  displayInformation(
    tabInformation["textTitle"],
    // modelResult[0]["summary_text"],

    summerizeResult
  );
});

async function getTabInformation(tab) {
  /**
   * Retrieves information from the active tab.
   * Title and the abstract-content is retrieved.
   **/
  //   turning the page into document object
  const response = await fetch(tab.url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const tabInformation = {
    textTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    textToSummarise: doc
      .querySelectorAll("div.abstract-content p")[0]
      .textContent.trim(),
  };
  // console.log("text title", tabInformation.textTitle);
  // console.log("text to be summerized", tabInformation.textToSummarise);
  return tabInformation;
}

// // Using an API

// async function runModel(model, text) {
//   console.log("run model is almost working");
//   /**
//    * Sends a request to a specified summarisation model given some text to summarise.
//    **/
//   const data = JSON.stringify({ inputs: text });
//   const endpoint = `https://api-inference.huggingface.co/models/${model}`;

//   const response = await fetch(endpoint, {
//     headers: { Authorization: `Bearer ${API_TOKEN}` },
//     method: "POST",
//     body: data,
//   });

//   const result = await response.json();

//   return result;
// }

// USING GPT3 API FROM OPENAI

// async function summarizeText(text, OPENAI_TOKEN) {
//   return new Promise((resolve, reject) => {
//     fetch("https://api.openai.com/v1/engines/text-davinci-003/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPENAI_TOKEN}`,
//       },
//       body: JSON.stringify({
//         // prompt: `provide a summary for this text in dr seuss style: ${text}`,
//         prompt: `simplify this text and dont summerize it: ${text}`,

//         max_tokens: 800,
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         const summary = data.choices[0].text;
//         // Do something with the summary
//         console.log("data is", data);
//         console.log("summary is", summary);
//         resolve(summary);
//       })
//       .catch((error) => {
//         console.error(error);
//         reject(error);
//       });
//   });
// }
// ****
const MAX_TOKENS = 800;
// Using Lower Temperature to generate a more predictable text
const TEMPERATURE = 0.5;
async function summarizeText(
  text,
  OPENAI_TOKEN,
  temperature = 0.4,
  model = "gpt-3.5-turbo"
) {
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: `simplify this text and dont summerize it: ${text}`,
      },
    ],
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_TOKEN}`,
    },
    body: JSON.stringify(payload),
  };
  const response = await fetch(url, options);
  const summary = await response.json();
  const summerizedMsg = summary.choices[0].message.content.trim();
  // Store the summary in local storage
  chrome.storage.local.set({ StoredSummary: summerizedMsg }, function () {
    console.log("Summary  get stored in local storage");
  });
  // chrome.storage.local.set({ StoredSummary: summerizedMsg }).then(() => {
  //   console.log("Value is set to " + summerizedMsg);
  // });
  chrome.storage.local.set({ test: "summary" }, function () {
    console.log("test stored in local storage");
  });
  // chrome.storage.local.get({ StoredSummary: summerizedMsg }, function () {
  //   // console.log(StoredSummary);
  // });
  return summerizedMsg;
}

// const options = {
//   contentType: "application/json",
//   headers: { Authorization: "Bearer " + OPENAI_TOKEN },
//   payload: JSON.stringify(payload),
// };
//   const summary = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
//   return summary.choices[0].message.content.trim();
// }
// ****
function displayInformation(title, summary) {
  /**
   * Displays the title and summary information in the extention pop-up.
   **/
  document.getElementsByClassName("main-heading")[0].textContent = title;
  document.getElementsByClassName("summary")[0].textContent = summary;
}

function toggleLoader(toggleSwitch) {
  /**
   * Toggles the display of the loader element.
   */
  if (toggleSwitch) {
    document.getElementById("loader").style.display = "flex";
    document.getElementById("loader").style.flexDirection = "column";
    document.getElementById("loader").style.alignItems = "center";
  } else {
    document.getElementById("loader").style.display = "none";
  }
}
