import { API_TOKEN } from "./config.js";

const MODEL = "facebook/bart-large-cnn";

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  const currentTab = tabs[0];

  toggleLoader(true);
  displayInformation("", "");

  const tabInformation = await getTabInformation(currentTab);
  const modelResult = await runModel(MODEL, tabInformation["textToSummarise"]);

  toggleLoader(false);
  displayInformation(
    tabInformation["textTitle"],
    modelResult[0]["summary_text"]
  );
});

// function displayInformation(title, summary) {
//   /**
//    * Displays the title and summary information in the extention pop-up.
//    **/
//   console.log("display information is working ");
//   document.getElementById("main-heading").textContent = title;
//   document.getElementById("summary").textContent = summary;
// }

async function getTabInformation(tab) {
  /**
   * Retrieves information from the active tab. In this case, it retrieves the
   * title of the article and the text that we want to summarise.
   **/
  //   turning the page into document object
  const response = await fetch(tab.url);
  const text = await response.text();
  //   console.log("responsetextis", text);

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  console.log("document is ", doc);
  const tabInformation = {
    textTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    textToSummarise: doc
      .querySelectorAll("div.abstract-content p")[0]
      .textContent.trim(),
  };
  console.log("text title", tabInformation.textTitle);
  console.log(tabInformation.textToSummarise);
  return tabInformation;
}

// // Using the API

async function runModel(model, text) {
  console.log("run model is almost working");
  /**
   * Sends a request to a specified summarisation model given some text to summarise.
   **/
  const data = JSON.stringify({ inputs: text });
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    method: "POST",
    body: data,
  });

  const result = await response.json();

  return result;
}

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
