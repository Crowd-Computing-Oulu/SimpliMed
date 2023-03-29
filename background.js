import { OPENAI_TOKEN } from "./config.js";

// just a test for chrome local storage
chrome.storage.local.set({ test: "21321" }, function () {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
  } else {
    console.log("Value is set to 21321");
  }
});
chrome.storage.local.get("test", function (result) {
  console.log("The value of 'test' is: " + result.test);
});

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
  const summerizeResultLVL1 = await summarizeTextLVL1(
    tabInformation["textToSummarise"],
    OPENAI_TOKEN
  );

  toggleLoader(false);
  displayInformation(
    tabInformation["textTitle"],
    // modelResult[0]["summary_text"],
    tabInformation["textToSummarise"],
    summerizeResult,
    summerizeResultLVL1
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
        content: `simplify this text like i am a university professor : ${text}`,
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
  console.log(summary);

  const summerizedMsg = summary.choices[0].message.content.trim();
  // Store the summary in local storage
  chrome.storage.local.set({ StoredSummary: summerizedMsg }, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      // console.log("storedsummery has been set.");
    }
  });
  chrome.storage.local.get("StoredSummary", function (result) {
    // console.log("The value of 'StoredSummary' is: " + result.StoredSummary);
  });

  return summerizedMsg;
}

async function summarizeTextLVL1(
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
        content: `simplify this text like i am a 7years old : ${text}`,
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
  console.log(summary);

  const summerizedMsg = summary.choices[0].message.content.trim();
  // Store the summary in local storage
  chrome.storage.local.set({ StoredSummary: summerizedMsg }, function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      // console.log("storedsummery has been set.");
    }
  });
  chrome.storage.local.get("StoredSummary", function (result) {
    // console.log("The value of 'StoredSummary' is: " + result.StoredSummary);
  });

  return summerizedMsg;
}

// ****
function displayInformation(title, originalAbs, summary, summary1) {
  // Displaying the original Abstract
  const originalAbsElement = document.getElementsByClassName("original-abs")[0];
  originalAbsElement.textContent = originalAbs;

  /**
   * Displays the title and summary information in the extention pop-up.
   **/

  const mainHeadingElement = document.getElementsByClassName("main-heading")[0];
  mainHeadingElement.textContent = title;
  const summaryElemnt = document.getElementsByClassName("summary")[0];
  summaryElemnt.textContent = summary;

  const summaryElemnt1 = document.getElementsByClassName("summary1")[0];
  summaryElemnt1.textContent = summary1;

  // Adding the slide bar after retrieving the summary and title
  if (
    summaryElemnt.textContent !== "" &&
    mainHeadingElement.textContent !== ""
  ) {
    document.getElementById("difficulty-lvl").classList.remove("hidden");
  }
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
// retrieving the selected value of user
// const contentSelection = document.querySelector(
//   'input[name="content-type"]:checked'
// ).value;
const rangeInput = document.querySelector('input[type="range"]');
rangeInput.addEventListener("change", () => {
  if (rangeInput.value === "1") {
    document.getElementsByClassName("original-obs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.remove("hidden");
    document.getElementsByClassName("summary1")[0].classList.remove("hidden");
  }
});
