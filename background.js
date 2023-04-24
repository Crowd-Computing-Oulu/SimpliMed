import { OPENAI_TOKEN } from "./config.js";
import { getActiveTabURL } from "./utilis.js";

// chrome.browserAction.onClicked.addListener(function (tab) {
//   // var windowWidth = 600; // Set your window width
//   // var windowHeight = 400; // Set your window height
//   // var screenWidth = screen.availWidth;
//   // var screenHeight = screen.availHeight;
//   // var left = Math.round((screenWidth - windowWidth) / 2);
//   // var top = Math.round((screenHeight - windowHeight) / 2);

//   chrome.windows.create(
//     {
//       url: "popup.html",
//       type: "popup",
//       width: 800,
//       height: 600,
//       left: screen.width / 2 - 800 / 2,
//       top: screen.height / 2 - 600 / 2,
//     },
//     function (window) {
//       chrome.windows.update(window.id, { focused: true });
//     }
//   );
// });

// just a test for chrome local storage

// document.addEventListener("DOMContentLoaded", async () => {
//   const activeTab = await getActiveTabURL();
//   if (activeTab.url.includes("pubmed.ncbi.nlm.nih.gov")) {
//     return;
//   } else {
//     const mainContentElement =
//       document.getElementsByClassName("main-content")[0];
//     mainContentElement.innerHTML = "<div>this aint the correct url </div>";
//   }
// });
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
  console.log("this is tab information", tabInformation);

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
    tabInformation["originalAbs"],
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

  // const abstractHtml = text.getElementById("abstract");

  const parser = new DOMParser();
  // coverting html into a document
  const doc = parser.parseFromString(text, "text/html");
  // to add all paraghraphs when we have different p for background, methods,...
  const paragraphs = doc.querySelectorAll("div.abstract-content p");
  const originalAbstractHtml = doc.getElementById("abstract");
  console.log("this is the original abst", originalAbstractHtml);
  let allParagraphs = "";
  for (let i = 0; i < paragraphs.length; i++) {
    allParagraphs += paragraphs[i].textContent;
  }
  console.log("paragraphs", paragraphs);
  console.log("allparagraphs", allParagraphs);

  const tabInformation = {
    textTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    textToSummarise: allParagraphs,
    originalAbs: originalAbstractHtml,
  };
  // console.log("text title", tabInformation.textTitle);
  // console.log("text to be summerized", tabInformation.textToSummarise);
  return tabInformation;
}

// ****
const MAX_TOKENS = 800;
// Using Lower Temperature to generate a more predictable text
const TEMPERATURE = 0.2;
async function summarizeText(
  text,
  OPENAI_TOKEN,
  // temperature = 0.4,
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
  // higher values like 0.8 will make the output more random,
  // while lower values like 0.2 will make it more focused and deterministic.
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
  // fixes the undefined problem
  if (originalAbs) {
    originalAbsElement.innerHTML = originalAbs.innerHTML;
  }

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
    // Slide bar will show after the content is loaded
    document.getElementById("difficulty-lvl").classList.remove("hidden");
  }
}

function toggleLoader(toggleSwitch) {
  /**
   * Toggles the display of the loader element.
   */
  if (toggleSwitch) {
    // document.getElementById("loader").style.display = "flex";
    // document.getElementById("loader").style.flexDirection = "column";
    // document.getElementById("loader").style.alignItems = "center";
  } else {
    document
      .getElementsByClassName("main-content")[0]
      .classList.remove("hidden");
    document.getElementsByClassName("loader-containerr")[0].style.display =
      "none";
  }
}
// retrieving the selected value of user
// const contentSelection = document.querySelector(
//   'input[name="content-type"]:checked'
// ).value;
const rangeInput = document.querySelector('input[type="range"]');
rangeInput.addEventListener("change", () => {
  // Showing the first lvl difficulty summary
  if (rangeInput.value === "1") {
    // console.log("the value is 1");
    document.getElementsByClassName("original-abs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.add("hidden");
    document.getElementsByClassName("summary1")[0].classList.remove("hidden");
    // Showing the second lvl difficulty summary
  } else if (rangeInput.value === "2") {
    // console.log("the value is 2");
    document.getElementsByClassName("original-abs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.remove("hidden");
    document.getElementsByClassName("summary1")[0].classList.add("hidden");
    // showing the original abs
  } else if (rangeInput.value === "3") {
    // console.log("the value is 3");
    // console.log(document.getElementsByClassName("original-abs")[0].textContent);
    document
      .getElementsByClassName("original-abs")[0]
      .classList.remove("hidden");
    document.getElementsByClassName("summary")[0].classList.add("hidden");
    document.getElementsByClassName("summary1")[0].classList.add("hidden");
  }
});
