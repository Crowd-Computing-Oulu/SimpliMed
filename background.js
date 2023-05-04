import { OPENAI_TOKEN } from "./config.js";

let currentTab;

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  currentTab = tabs[0];

  // To check if the user is on the right website
  if (currentTab.url.indexOf("pubmed.ncbi.nlm.nih.gov") === -1) {
    console.log("this url is not supported");
    const mainContentElement =
      document.getElementsByClassName("main-content")[0];
    const lodaerContainerElement =
      document.getElementsByClassName("loader-container")[0];
    lodaerContainerElement.classList.add("hidden");
    mainContentElement.classList.remove("hidden");
    mainContentElement.innerHTML = `<div class="error-message"> This Url is not supported by the extention!</div>`;
  }

  toggleLoader(true);
  // displayInformation("", "");

  const tabInformation = await getTabInformation(currentTab);
  console.log("current tab is ", currentTab);

  chrome.storage.local.get("urls", function (data) {
    (async function () {
      if (data.urls[currentTab.url]) {
        console.log(
          "This Abstract have been summerized previously, this is the result"
        );
        toggleLoader(false);
        displayInformation(
          tabInformation["textTitle"],
          tabInformation["originalAbs"],
          data.urls[currentTab.url].summaryElementary,
          data.urls[currentTab.url].summaryAdvanced
        );
      } else {
        console.log("this is a new Abstract, which will be summerized soon");
        const summerizeElementaryResult = await summarizeTextElementary(
          tabInformation["textToSummerize"],
          OPENAI_TOKEN
        );
        const summerizeAdvancedResult = await summarizeTextAdvanced(
          tabInformation["textToSummerize"],
          OPENAI_TOKEN
        );
        displayInformation(
          tabInformation["textTitle"],
          tabInformation["originalAbs"],
          summerizeElementaryResult,
          summerizeAdvancedResult
        );
        toggleLoader(false);
      }
    })();
    // Check if the URL is already in the data object
    // console.log(
    //   "this paper already exist in the data base,",
    //   data.urls[currentTab.url]
    // );

    // chrome.storage.local.get("urls", function (data) {
    //   console.log(
    //     "data second properrty is ...",
    //     data.urls[currentTab.url].summaryElementary
    //   );
    // });
  });
  // if (data.urls[currentTab.url]) {
  //   const summerizeElementaryResult = await summarizeTextElementary(
  //     tabInformation["textToSummerize"],
  //     OPENAI_TOKEN
  //   );
  //   console.log(data);
  // }

  // const summerizeElementaryResult = await summarizeTextElementary(
  //   tabInformation["textToSummerize"],
  //   OPENAI_TOKEN
  // );
  // const summerizeAdvancedResult = await summarizeTextAdvanced(
  //   tabInformation["textToSummerize"],
  //   OPENAI_TOKEN
  // );
  // console.log(summerizeElementaryResult);

  // toggleLoader(false);
  // displayInformation(
  //   tabInformation["textTitle"],
  //   tabInformation["originalAbs"],
  //   summerizeElementaryResult,
  //   summerizeAdvancedResult
  // );
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
  // coverting html into a document
  const doc = parser.parseFromString(text, "text/html");
  // to add all paraghraphs when we have different p for background, methods,...
  const paragraphs = doc.querySelectorAll("div.abstract-content p");
  const originalAbstractHtml = doc.getElementById("abstract");

  let allParagraphs = "";
  for (let i = 0; i < paragraphs.length; i++) {
    allParagraphs += paragraphs[i].textContent;
  }
  const tabInformation = {
    textTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    textToSummerize: allParagraphs,
    originalAbs: originalAbstractHtml,
  };
  return tabInformation;
}

// ****
const MAX_TOKENS = 800;
// Using Lower Temperature to generate a more predictable text
const TEMPERATURE = 0.2;
async function summarizeTextElementary(
  text,
  OPENAI_TOKEN,
  model = "gpt-3.5-turbo"
) {
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },

      {
        role: "user",
        content: `Simplify this text for a audience with technical background of the subject, target level of simplification is 8 out of 10. Keep the technical terms, jargon and important information.  Please ensure that the article retains its main ideas and arguments: ${text}`,
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
  return summerizedMsg;
}

async function summarizeTextAdvanced(
  text,
  OPENAI_TOKEN,
  // higher values like 0.8 will make the output more random,
  // while lower values like 0.2 will make it more focused and deterministic.
  temperature = 0.2,
  model = "gpt-3.5-turbo"
) {
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: ` Simplify this text for a general audience with no technical background of the subject, target level of simplification is 2out of 10.  There are no specific sections or concepts within the text that need to  be emphasized. Technical terms and jargon can be simplified or  explained, but important information should not be lost in the process.  Please ensure that the article retains its main ideas and arguments: ${text}`,
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
  // console.log(summary);

  const summerizedMsg = summary.choices[0].message.content.trim();

  return summerizedMsg;
}

// ****
function displayInformation(title, originalAbs, summary, summary1) {
  console.log("the summary inside display information is", summary);
  // store in the storage
  chrome.storage.local.get("urls", function (data) {
    // if the data object doesnt exist, create it
    if (!data.urls) {
      data.urls = {};
      console.log("data object created");
    }
    // Check if the URL is already in the data object
    if (!data.urls[currentTab.url]) {
      // If the URL isn't in the data object yet, create a new entry
      // console.log("type of this summary is", typeof storedSummary1);
      // console.log("summary is:", summary);
      // const testtest = JSON.stringify(storedSummary1);
      data.urls[currentTab.url] = {
        summaryElementary: summary,
        summaryAdvanced: summary1,
      };
      // console.log(storedSummary1);
      console.log("new entry added");
      // saving the data
      chrome.storage.local.set({ urls: data.urls }, function () {
        console.log("Data saved successfully!");
      });
    } else {
      console.log("URL already exists in storage.");
    }
    chrome.storage.local.get("urls", function (data) {
      console.log("data urls are ...", data.urls[currentTab.url]);
    });
  });

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

  const summaryElementaryElement =
    document.getElementsByClassName("summary")[0];
  // console.log("summary before textcontent is,", summary);
  summaryElementaryElement.textContent = summary;

  const summaryAdvancedElement = document.getElementsByClassName("summary1")[0];
  summaryAdvancedElement.textContent = summary1;

  // Adding the slide bar after retrieving the summary and title
  if (
    summaryElementaryElement.textContent !== "" &&
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
    document.getElementsByClassName("loader-container")[0].style.display =
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
    document.getElementsByClassName("original-abs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.add("hidden");
    document.getElementsByClassName("summary1")[0].classList.remove("hidden");
    document.getElementsByClassName("title")[0].classList.remove("hidden");

    // Showing the second lvl difficulty summary
  } else if (rangeInput.value === "2") {
    document.getElementsByClassName("original-abs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.remove("hidden");
    document.getElementsByClassName("summary1")[0].classList.add("hidden");
    document.getElementsByClassName("title")[0].classList.remove("hidden");

    // showing the original abs
  } else if (rangeInput.value === "3") {
    document
      .getElementsByClassName("original-abs")[0]
      .classList.remove("hidden");
    document.getElementsByClassName("title")[0].classList.add("hidden");

    document.getElementsByClassName("summary")[0].classList.add("hidden");
    document.getElementsByClassName("summary1")[0].classList.add("hidden");
  }
});
