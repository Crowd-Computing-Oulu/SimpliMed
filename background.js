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
    console.log("current tab is", currentTab);
    console.log("current tab url is", currentTab.url);
    (async function () {
      // Checking the both arguments, To prevent an error for undefined data.urls
      if (data.urls && data.urls[currentTab.url]) {
        console.log(
          "This Abstract have been summarized previously, this is the result"
        );
        toggleLoader(false);
        displayInformation(
          tabInformation["textTitle"],
          tabInformation["originalAbs"],
          data.urls[currentTab.url].summaryElementary,
          data.urls[currentTab.url].summaryAdvanced,
          data.urls[currentTab.url].summaryTitle
        );
      } else {
        console.log("this is a new Abstract, which will be summarized soon");
        // to summarize the text for elementary level
        const summarizeElementaryResult = await summarizeTextElementary(
          tabInformation["textToSummarize"],
          OPENAI_TOKEN
        );
        // to summarize the text for advance level

        const summarizeAdvancedResult = await summarizeTextAdvanced(
          tabInformation["textToSummarize"],
          OPENAI_TOKEN
        );
        // to summarize the title
        const summarizedTitleResult = await summarizeTitle(
          tabInformation["textTitle"],
          OPENAI_TOKEN
        );
        displayInformation(
          tabInformation["textTitle"],
          tabInformation["originalAbs"],
          summarizeElementaryResult,
          summarizeAdvancedResult,
          summarizedTitleResult
        );
        toggleLoader(false);
      }
    })();
  });
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
  // remove the keywords if the abstract contains any
  if (originalAbstractHtml.querySelector("p > strong.sub-title ").parentNode) {
    console.log("am i working?");
    const subTitleParagraph = originalAbstractHtml.querySelector(
      "p > strong.sub-title "
    ).parentNode;
    console.log("this is subtitle", subTitleParagraph);
    // Remove the paragraph with the keywords
    const paragraphParent = subTitleParagraph.parentNode;
    originalAbstractHtml.removeChild(subTitleParagraph);
    console.log("after remove a child", paragraphParent);
  }

  let allParagraphs = "";
  for (let i = 0; i < paragraphs.length; i++) {
    allParagraphs += paragraphs[i].textContent;
  }
  const tabInformation = {
    textTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    textToSummarize: allParagraphs,
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
      {
        role: "system",
        content:
          "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the following abstract, using simplification levels. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. In any case, remember to retain key information in the abstract, but transform all jargon and complicated medical terminology into easier-to-read text, according to the wanted simplification level.",
      },

      {
        role: "user",
        content: ` Simplify the following abstract of a medical research article to the general public. The target level of simplification is 8 out of 10. Please ensure that the article retains its main ideas and arguments.  ${text}`,
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
  const summarizedMsg = summary.choices[0].message.content.trim();
  return summarizedMsg;
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
      {
        role: "system",
        content:
          "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the following abstract, using simplification levels. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. In any case, remember to retain key information in the abstract, but transform all jargon and complicated medical terminology into easier-to-read text, according to the wanted simplification level.",
      },
      {
        role: "user",
        content: `  Simplify the following abstract of a medical research article to the general public. The target level of simplification is 8 out of 10. Please ensure that the article retains its main ideas and arguments.  ${text}`,
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

  const summarizedMsg = summary.choices[0].message.content.trim();

  return summarizedMsg;
}

async function summarizeTitle(title, OPENAI_TOKEN, model = "gpt-3.5-turbo") {
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },

      {
        role: "user",
        content: `Simplify this title for a audience without technical background of the subject: ${title}`,
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
  const summarizedTitle = summary.choices[0].message.content.trim();
  return summarizedTitle;
}

// ****
function displayInformation(
  title,
  originalAbs,
  summary,
  summary1,
  summarizedTitle
) {
  console.log(
    "the summarized title inside display information is",
    summarizedTitle
  );
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
      data.urls[currentTab.url] = {
        summaryElementary: summary,
        summaryAdvanced: summary1,
        summaryTitle: summarizedTitle,
      };
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

  const mainHeadingElement =
    document.getElementsByClassName("original-title")[0];
  mainHeadingElement.textContent = title;

  const summaryElementaryElement =
    document.getElementsByClassName("summary")[0];
  summaryElementaryElement.textContent = summary;

  const summaryAdvancedElement = document.getElementsByClassName("summary1")[0];
  summaryAdvancedElement.textContent = summary1;
  console.log(
    "this is the summaradvance element",
    summaryAdvancedElement.textContent
  );

  const summaryTitleElement =
    document.getElementsByClassName("summary-title")[0];
  summaryTitleElement.textContent = summarizedTitle;
  console.log(
    "this is the summartitle element:::",
    summaryTitleElement.textContent
  );
  // Adding the slide bar after retrieving the summary and title
  if (
    summaryElementaryElement.textContent !== "" &&
    mainHeadingElement.textContent !== "" &&
    summaryTitleElement.textContent !== ""
  ) {
    // Slide bar will show after the content is loaded
    document.getElementById("difficulty-lvl").classList.remove("hidden");
  } else {
    console.log("one of the fields are empty");
  }
}

function toggleLoader(toggleSwitch) {
  // Doesnt show the loader anymore
  if (!toggleSwitch) {
    document
      .getElementsByClassName("main-content")[0]
      .classList.remove("hidden");
    document.getElementsByClassName("loader-container")[0].style.display =
      "none";
  }
}
// retrieving the selected value of user
const rangeInput = document.querySelector('input[type="range"]');
rangeInput.addEventListener("change", () => {
  // Showing the first lvl difficulty summary
  if (rangeInput.value === "1") {
    document.getElementsByClassName("original-abs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.remove("hidden");
    document.getElementsByClassName("summary1")[0].classList.add("hidden");
    document
      .getElementsByClassName("original-title")[0]
      .classList.add("hidden");
    document
      .getElementsByClassName("summary-title")[0]
      .classList.remove("hidden");
    document
      .getElementsByClassName("title-abstract")[0]
      .classList.remove("hidden");

    // Showing the second lvl difficulty summary
  } else if (rangeInput.value === "2") {
    document.getElementsByClassName("original-abs")[0].classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.add("hidden");
    document.getElementsByClassName("summary1")[0].classList.remove("hidden");
    document
      .getElementsByClassName("title-abstract")[0]
      .classList.remove("hidden");
    document
      .getElementsByClassName("original-title")[0]
      .classList.add("hidden");
    document
      .getElementsByClassName("summary-title")[0]
      .classList.remove("hidden");

    // showing the original abs
  } else if (rangeInput.value === "3") {
    document
      .getElementsByClassName("original-abs")[0]
      .classList.remove("hidden");
    document
      .getElementsByClassName("title-abstract")[0]
      .classList.add("hidden");
    document.getElementsByClassName("summary")[0].classList.add("hidden");
    document.getElementsByClassName("summary1")[0].classList.add("hidden");
    document
      .getElementsByClassName("original-title")[0]
      .classList.remove("hidden");
    document.getElementsByClassName("summary-title")[0].classList.add("hidden");
  }
});
