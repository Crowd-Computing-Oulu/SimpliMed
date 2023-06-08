import { OPENAI_TOKEN } from "./config.js";

let currentTab;
let originalText;

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
  // Throws an error if the user is on the pubmed website but on an incorrect path
  if (
    currentTab.url.includes("https://pubmed.ncbi.nlm.nih.gov/trending/") ||
    currentTab.url.includes("https://pubmed.ncbi.nlm.nih.gov/?term")
  ) {
    console.log("You need to open an article");
    const mainContentElement =
      document.getElementsByClassName("main-content")[0];
    const lodaerContainerElement =
      document.getElementsByClassName("loader-container")[0];
    lodaerContainerElement.classList.add("hidden");
    mainContentElement.classList.remove("hidden");
    mainContentElement.innerHTML = `<div class="error-message"> You need to open an article!</div>`;
  }

  // To check if the correct url has a valid abstract
  // if()

  toggleLoader(true);
  // displayInformation("", "");

  const tabInformation = await getTabInformation(currentTab);
  // try {
  //   // Process the tab information
  //   // ...
  // } catch (error) {
  //   // Handle the error
  //   console.log("there is an error in the catch");
  //   console.error(error);
  // }

  // console.log("current tab is ", currentTab);

  chrome.storage.local.get("urls", function (data) {
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

        const responseFromServer = await requestToServer(
          tabInformation["url"],
          tabInformation["textTitle"],
          tabInformation["textToSummarize"]
        );
        console.log(
          "this is responseFrom the server in if",
          responseFromServer
        );
      } else {
        // if the abstract doesnt exist in the database, we will generate it
        console.log("this is a new Abstract, which will be summarized soon");
        // to summarize the text for elementary level
        const summarizeElementaryResult = await summarizeTextElementary(
          tabInformation["textToSummarize"],
          OPENAI_TOKEN
        );
        const responseFromServer = await requestToServer(
          tabInformation["url"],
          tabInformation["textTitle"],
          tabInformation["textToSummarize"]
        );
        console.log(
          "this is responseFrom the server in else",
          responseFromServer
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
  if (!originalAbstractHtml) {
    console.log(
      "This article doesnt have a valid abstract, please choose another article"
    );
    alert(
      "This article doesnt have a valid abstract, please choose another article"
    );
    toggleLoader(false);
    throw new Error(
      "This Article has no Abstract, please choose another Article."
    );
  }

  // remove the keywords if the abstract contains any
  // if (originalAbstractHtml.querySelector("p > strong.sub-title ").parentNode) {
  //   console.log("am i working?");
  //   const subTitleParagraph = originalAbstractHtml.querySelector(
  //     "p > strong.sub-title "
  //   ).parentNode;
  //   console.log("this is subtitle", subTitleParagraph);
  //   // Remove the paragraph with the keywords
  //   const paragraphParent = subTitleParagraph.parentNode;
  //   originalAbstractHtml.removeChild(paragraphParent);
  //   console.log("after remove a child", paragraphParent);
  // }

  let allParagraphs = "";
  for (let i = 0; i < paragraphs.length; i++) {
    allParagraphs += paragraphs[i].textContent;
  }
  originalText = allParagraphs;

  const tabInformation = {
    textTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    textToSummarize: allParagraphs,
    originalAbs: originalAbstractHtml,
    url: tab.url,
  };
  return tabInformation;
}

// ***
// sending request to the server
async function requestToServer(url, title, text) {
  // retrive the access token from the storage
  let accessToken = "";
  chrome.storage.local.get("accessToken", function (data) {
    accessToken = data.accessToken;
    accessToken = "JWT " + accessToken;
    console.log(
      "the authorization is:",
      typeof accessToken,
      "/",
      `${accessToken}`,
      "/"
    );
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ODBhMTZlYzZlNTBiYWJhOGVhMzVmMCIsImlhdCI6MTY4NjE1MTUzNCwiZXhwIjoxNjg3MDE1NTM0fQ.e9BNV4p4neZn0pzAoFO9HORiSrsRM565pomMqXODB-Q",
    },
    body: JSON.stringify({
      originalAbstract: text,
      originalTitle: title,
      url,
    }),
  };
  try {
    const test = JSON.stringify({
      originalAbstract: text,
      originalTitle: title,
      url,
    });
    console.log("this is test", typeof test, test);
    console.log("this is title, text and url", text, title, url);
    var response = await fetch(
      "http://localhost:8080/abstracts/abstract",
      options
    );
    response = await response.json();
    console.log("the response after json is", response);
    console.log("the response abstrqact  is", response.abstract);

    console.log("the response message is", response.message);

    // response = response.choices[0].message.content.trim();
  } catch (error) {
    console.log(error);
  }
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
  console.log(
    "this is url",
    JSON.stringify(url),
    "this is options:",
    JSON.stringify(options)
  );
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
    // click the askBtn to show the Questions section
    // document.getElementById("askBtn").classList.remove("hidden");
  }
}
let originalTime = 0;
let advancedTime = 0;
let elementaryTime = 0;
let timerInterval;
// retrieving the selected value of user
const rangeInput = document.querySelector('input[type="range"]');
rangeInput.addEventListener("change", () => {
  // Showing the first lvl difficulty summary
  if (rangeInput.value === "1") {
    // measuring time spent on the Elementary abstract
    clearInterval(timerInterval); // Clear previous interval to start fresh
    timerInterval = setInterval(() => {
      elementaryTime++; // Increment the Elementary time
      console.log(elementaryTime);
    }, 1000); // Update the elapsed time every second the user is on elementary abstract

    // adding / removing hidden class based on the range inputvalue
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
    // measuring time spent on the advanced abstract
    clearInterval(timerInterval); // Clear previous interval to start fresh
    timerInterval = setInterval(() => {
      advancedTime++; // Increment the advanced time
      console.log(advancedTime);
    }, 1000); // Update the elapsed time every second the user is on advanced abstract

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
    // measuring time spent on the original abstract
    clearInterval(timerInterval); // Clear previous interval to start fresh
    timerInterval = setInterval(() => {
      originalTime++; // Increment the original time
      console.log(originalTime);
    }, 1000); // Update the elapsed time every second the user is on original abstract

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

// // This funtion will open up the Q&A like a drop down menu
// document.getElementById("askBtn").addEventListener("click", function () {
//   var questionsSection = document.getElementById("questionsSection");
//   if (questionsSection.classList.contains("hidden")) {
//     questionsSection.classList.remove("hidden");
//   } else {
//     questionsSection.classList.add("hidden");
//   }
// });
// // This funtion sends users' new questions and old conversation to the AI and recieves re. open up the Q&A like a drop down menu
// let conversation = [];
// let allQuestions = [];
// let allQuestionsString;
// let allAnswers = [];
// let allAnswersString;

// document.getElementById("sendBtn").addEventListener("click", function (e) {
//   e.preventDefault();
//   var questionInput = document.getElementById("questionInput").value; // getting the question from user
//   allQuestions.push(questionInput); //pushing the new question to the questions
//   allQuestionsString = allQuestions.join(" "); // joining the elements of the array to create a single string
//   askQuestion(questionInput, originalText, OPENAI_TOKEN); //calling the function that sends the question
//   console.log("all answers is:", allAnswersString);
//   console.log("all questions", allQuestionsString);
// });
// async function askQuestion(
//   questionInput,
//   originalText,
//   OPENAI_TOKEN,
//   model = "gpt-3.5-turbo"
// ) {
//   const url = "https://api.openai.com/v1/chat/completions";

//   // Constructing message object for the user's question
//   // const userMessage = {
//   //   role: "user",
//   //   content: `I have provided this text to you already: ${originalText} and now I have a question which is ${questionInput}`,
//   // };
//   // Adding the user message to the conversation
//   // conversation.push(userMessage);
//   // console.log("conversation is", conversation);

//   const payload = {
//     model: model,
//     messages: [
//       {
//         role: "system",
//         content: "You are an expert science communicator",
//       },
//       {
//         role: "user",
//         content: ` I have provided this text to you: ${originalText} and here are my questions: "${allQuestionsString}" which you already answered with "${allAnswersString}", this is my new question ${questionInput} `,
//       },
//     ],
//     temperature: TEMPERATURE,
//     max_tokens: MAX_TOKENS,
//   };
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${OPENAI_TOKEN}`,
//     },
//     body: JSON.stringify(payload),
//   };
//   const response = await fetch(url, options);
//   const answer = await response.json();
//   console.log("answer is", answer);
//   const answerMsg = answer.choices[0].message.content.trim();

//   allAnswers.push(answerMsg);
//   allAnswersString = allAnswers.join(" ");
//   console.log("this is the answer", answerMsg);

//   document.getElementById("answers").textContent = answerMsg; // show the answer to the user
//   document.getElementById("answers").classList.remove("hidden"); // show the answer to the user

//   return answerMsg;
// }
