var port = chrome.runtime.connect({ name: "popupConnection" });

let currentTab = "";
let originalText = "";
let originalAbstractHtml = "";
let state = {};
let timeValue = null;
let delta = 0;
let timeType = "";

document.addEventListener("DOMContentLoaded", () => {
  // Close the popup window
  // document.getElementById("closeBtn").addEventListener("click", function () {
  //   window.close();
  // });
  const mainContentElement = document.getElementsByClassName("main-content")[0];
  // const loaderContainerElement =this is
  //   document.getElementsByClassName("loader-container")[0];
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      currentTab = tabs[0];
      const regex = /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/;
      // To check if the URL is correct (containing this string)
      if (currentTab.url.indexOf("pubmed.ncbi.nlm.nih.gov") === -1) {
        document.getElementById("getAbstract").classList.add("hidden");

        const container = document.getElementById("container");
        const newArticleMsg = document.createElement("p");
        newArticleMsg.id = "newArticleMsg";
        newArticleMsg.classList.add("error-message");
        newArticleMsg.innerHTML = `<p><i class="fas fa-exclamation"></i> This Website is not supported by the extension, please go to https://pubmed.ncbi.nlm.nih.gov/</p>`;

        const firstChild = container.firstChild; // Get the first child of the parent element
        container.insertBefore(newArticleMsg, firstChild);
        // docuemnt
        //   .getElementById("instructions-container")
        //   .classList.add("hidden");
        // mainContentElement.classList.remove("hidden");
        // mainContentElement.innerHTML = `<div class="error-message"><i class="fas fa-exclamation"></i> This Website is not supported by the extension, please go to https://pubmed.ncbi.nlm.nih.gov/</div>`;
      } else if (!regex.test(currentTab.url)) {
        document.getElementById("getAbstract").classList.add("hidden");
        // mainContentElement.innerHTML = `<div class="error-message"><i class="fas fa-exclamation"></i> You are on the correct website, but you need to open an article</div>`;

        const container = document.getElementById("container");
        const newArticleMsg = document.createElement("p");
        newArticleMsg.id = "newArticleMsg";
        newArticleMsg.classList.add("error-message");
        newArticleMsg.innerHTML = `<p><i class="fas fa-exclamation"></i> You are on the correct website, but you need to open an article!</p>`;
        const firstChild = container.firstChild; // Get the first child of the parent element
        container.insertBefore(newArticleMsg, firstChild);
        // docuemnt
        //   .getElementById("instructions-container")
        //   .classList.add("hidden");
      } else {
        // the next code is needed to throw an error when we dont have an abstract in an article!
        await getTabInformation(currentTab);
      }
    }
  );

  // GET ABSTRACT INFORMATION
  const getAbstractBtn = document.getElementById("getAbstract");
  getAbstractBtn.addEventListener("click", async () => {
    // removing the error message if there is any
    // if (document.getElementById("requestSummaryError")) {
    //   document.getElementById("requestSummaryError").remove();
    // }
    // removing the newArticleMsg if any
    removeElement("requestSummaryError");
    removeElement("newArticleMsg");
    // if (document.getElementById("newArticleMsg")) {
    //   document.getElementById("newArticleMsg").remove();
    // }
    document.getElementById("instructions-container").classList.add("hidden");
    document.getElementById("main-content").classList.add("hidden");
    document.getElementById("feedbackValue-container").classList.add("hidden");
    // document
    //   .getElementById("feedbackText-container")
    //   .classList.remove("hidden");
    // document.getElementById("feedbackTextForm").classList.remove("hidden");
    document.getElementById("feedbackSubmisisonResult").classList.add("hidden");

    const abstractInformation = await getTabInformation(currentTab);
    chrome.runtime.sendMessage({
      action: "getAbstractInfromation",
      abstractInformation,
    });
    getAbstractBtn.classList.add("hidden");
  });
  // Listeners
  chrome.runtime.onMessage.addListener((message) => {
    // listening for a change in state
    if (message.action === "stateUpdate") {
      state = message.state;
      // showing the number of feedbacks
      updateStudyState();
      // alerting the user its a  new article
      if (state.abstractData) {
        if (currentTab.url != state.abstractData.url) {
          const regex = /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/;
          if (regex.test(currentTab.url)) {
            // chrome.runtime.sendMessage("newUrl");
            if (!document.getElementById("newArticleMsg")) {
              const container = document.getElementById("container");
              const newArticleMsg = document.createElement("p");
              // err.classList.add("error-message");
              newArticleMsg.id = "newArticleMsg";
              newArticleMsg.classList.add("error-message");
              newArticleMsg.textContent = `You are on a new article page, to get the new result, click on the "get abstract" button at top left corner! (Below is the result of your previous abstract!)`;
              const firstChild = container.firstChild; // Get the first child of the parent element
              container.insertBefore(newArticleMsg, firstChild);
            }
          }
        }
      }
      // console.log("the state is,", state);
      if (message.state.isLoading) {
        document
          .getElementsByClassName("loader-container")[0]
          .classList.remove("hidden");
        document.getElementById("getAbstract").classList.add("hidden");
      } else {
        document
          .getElementsByClassName("loader-container")[0]
          .classList.add("hidden");
        document.getElementById("getAbstract").classList.remove("hidden");
      }
      if (message.state.accessToken) {
        document.getElementById("login-container").classList.add("hidden");
        document.getElementById("main-content").classList.remove("hidden");
        document.getElementById("header").classList.remove("hidden");
        document.getElementById("header-username").textContent =
          message.state.username;
        // if user is logged in, he will see the instructions

        if (message.state.abstractData) {
          document.getElementById("difficulty-lvl__input").value =
            message.state.difficultyLevel;
          sliderUpdated(message.state.difficultyLevel, false);
          if (
            message.state.difficultyLevel > 0 &&
            message.state.difficultyLevel < 4
          ) {
            document
              .getElementById("feedbackValue-container")
              .classList.remove("hidden");
          }
          document.getElementsByClassName("summary-title")[0].textContent =
            message.state.abstractData.summerizedTitle;
          document.getElementsByClassName("original-title")[0].textContent =
            message.state.abstractData.originalTitle;
          document.getElementsByClassName("advanced-abs")[0].textContent =
            message.state.abstractData.advancedAbstract;
          document.getElementsByClassName("elementary-abs")[0].textContent =
            message.state.abstractData.elementaryAbstract;
          //below part needs to be fixed
          document.getElementsByClassName("original-abs")[0].textContent =
            message.state.abstractData.originalAbstract;
        } else {
          document.getElementById("main-content").classList.add("hidden");
        }
      } else {
        // console.log("user should see the loginpage again");
        // if there is no access token, the user will see the login section
        document.getElementById("login-container").classList.remove("hidden");
        document.getElementById("main-content").classList.add("hidden");
        document.getElementById("getAbstract").classList.add("hidden");
        document.getElementById("header").classList.add("hidden");
        // document
        //   .getElementById("feedbackValue-container")
        //   .classList.add("hidden");

        // document
        //   .getElementById("instructions-container")
        //   .classList.add("hidden");
      }
      if (message.state.feedback) {
        updateFeedbackForm();
        if (message.state.feedback.status === "failed") {
          document
            .getElementById("feedbackSubmisisonResult")
            .classList.remove("hidden");
          document.getElementById("feedbackSubmisisonResult").textContent =
            message.state.feedback.message;
        } else if (message.state.feedback.status === "sent") {
          document.getElementById("feedbackTextForm").classList.add("hidden");
          document
            .getElementById("feedbackSubmisisonResult")
            .classList.remove("hidden");
          document.getElementById("feedbackSubmisisonResult").textContent =
            message.state.feedback.message;
        } else if (message.state.feedback.status === "empty") {
        }
      }
      if (!message.state.instructionShown && message.state.accessToken) {
        document
          .getElementById("instructions-container")
          .classList.remove("hidden");
      } else {
        document
          .getElementById("instructions-container")
          .classList.add("hidden");
      }
    } else if (message.action === "showLoading") {
      document
        .getElementsByClassName("loader-container")[0]
        .classList.remove("hidden");
      // document.getElementById("instructions-container").classList.add("hidden");
    } else if (message.action === "hideLoading") {
      document
        .getElementsByClassName("loader-container")[0]
        .classList.add("hidden");
      // document.getElementById("instructions-container").classList.add("hidden");
    } else if (message.action === "requestSummaryError") {
      const container = document.getElementById("container");
      const err = document.createElement("p");
      err.classList.add("error-message");
      err.id = "requestSummaryError";
      err.textContent = message.err;
      const firstChild = container.firstChild; // Get the first child of the parent element
      container.insertBefore(err, firstChild);
      // console.log("requestSummaryError", message.err);
    } else if (message.action === "emptySubmissionError") {
      const emptySubmissionError = document.createElement("p");
      emptySubmissionError.style.color = "red";
      emptySubmissionError.textContent = message.err;
      document
        .getElementById("feedbackTextForm")
        .appendChild(emptySubmissionError);
      // console.log("i am not rugggngn");
    }
  });

  // LOGIN
  const loginBtn = document.getElementById("login-form");
  loginBtn.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    chrome.runtime.sendMessage({ action: "login", username });
  });
  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    document.getElementById("feedbackValue-container").classList.add("hidden");
    document.getElementById("feedbackText-container").classList.add("hidden");

    chrome.runtime.sendMessage({ action: "logout" });
  });

  const difficultyLvlInput = document.getElementById("difficulty-lvl__input");
  if (difficultyLvlInput.value === "0") {
    document.getElementById("abstract-container").classList.add("hidden");
    document
      .getElementById("difficulty-lvl_instructions")
      .classList.remove("hidden");

    // the following code doesnt work, we use the background to set the container as hidden
    // document.getElementById("feedbackValue-container").classList.add("hidden");
  }

  difficultyLvlInput.addEventListener("input", () => {
    sliderUpdated(difficultyLvlInput.value, true); // true indicates that user has manually updated the difficulty Slider
  });
  //FEEDBACK RADIO
  document.getElementById("valueSubmitBtn").addEventListener("click", () => {
    const formName = document.getElementById("formName").value;
    var feedbackType = "";
    switch (formName) {
      case "elementaryForm":
        feedbackType = "elementaryDifficulty";
        break;
      case "advancedForm":
        feedbackType = "advancedDifficulty";
        break;
      case "originalForm":
        feedbackType = "originalDifficulty";
        break;
      default:
        return;
    }
    var radios = document.getElementsByName("feedbackValue");
    var feedbackValue = null;
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        feedbackValue = radios[i].value;
        break;
      }
    }

    if (feedbackValue) {
      document.getElementById("error").classList.add("hidden");
      document.getElementById("result").classList.remove("hidden");
      // document.getElementById("error").innerHTML = "";
      // document.getElementById("result").innerHTML = "Submitted!";
      chrome.runtime.sendMessage({
        action: "feedbackValueSubmitted",
        feedbackType,
        feedbackValue,
      });
      emptyFeedbackForm();
    } else {
      document.getElementById("error").classList.remove("hidden");
      document.getElementById("result").classList.add("hidden");
      // document.getElementById("error").innerHTML = "Please select an option!";
      // document.getElementById("result").innerHTML = "";
    }
  });

  // Finish
  document.getElementById("finishBtn").addEventListener("click", () => {
    const feedbackText = document.getElementById("feedbackTextInput").value;
    chrome.runtime.sendMessage({
      action: "feedbackTextSubmitted",
      feedbackText,
    });
  });
  chrome.runtime.sendMessage({ action: "state" });
});

// Changint difficulty level

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
  // ***
  originalAbstractHtml = doc.getElementById("abstract");
  if (!originalAbstractHtml) {
    document.getElementById("getAbstract").classList.add("hidden");
    const container = document.getElementById("container");
    const err = document.createElement("p");
    err.classList.add("error-message");
    err.id = "noAbstract-error";
    err.textContent =
      "This Article has no Abstract, please open another Article!";
    const firstChild = container.firstChild; // Get the first child of the parent element
    container.insertBefore(err, firstChild);
    // throw new Error(
    //   "This Article has no Abstract, please choose another Article."
    // );
  }
  // ***//
  let allParagraphs = "";
  for (let i = 0; i < paragraphs.length; i++) {
    allParagraphs += paragraphs[i].textContent;
  }
  originalText = allParagraphs;

  const abstractInformation = {
    originalTitle: doc
      .getElementsByClassName("heading-title")[0]
      .textContent.trim(),
    originalAbstract: allParagraphs,
    originalHtml: originalAbstractHtml,
    url: tab.url,
  };
  return abstractInformation;
}
function updateFeedbackForm() {
  const formName = document.getElementById("formName").value;
  let feedbackType = "";
  switch (formName) {
    case "elementaryForm":
      feedbackType = "elementaryDifficulty";
      break;
    case "advancedForm":
      feedbackType = "advancedDifficulty";
      break;
    case "originalForm":
      feedbackType = "originalDifficulty";
      break;
    default:
      return;
  }
  if (state.feedback) {
    if (state.feedback[feedbackType]) {
      document.getElementById("feedbackValueForm").classList.add("hidden");
      document.getElementById("result").classList.remove("hidden");
    } else {
      document.getElementById("feedbackValueForm").classList.remove("hidden");
      document.getElementById("result").classList.add("hidden");
    }
  }
}

function sliderUpdated(difficultyLevel, shouldUpdateBackend) {
  document.getElementById("error").classList.add("hidden");
  if (shouldUpdateBackend) {
    chrome.runtime.sendMessage({
      action: "sendDifficultyLevel",
      difficultyLevel,
    });
  }

  // Showing the instructions
  if (difficultyLevel === "0") {
    chrome.runtime.sendMessage({
      action: "tempTimeUpdate",
      timeValue: 0,
      timeType: "",
    });

    document.getElementById("abstract-container").classList.add("hidden");
    document.getElementById("feedbackValue-container").classList.add("hidden");
    document.getElementById("feedbackText-container").classList.add("hidden");
    document
      .getElementById("difficulty-lvl_instructions")
      .classList.remove("hidden");

    // Showing the elementary summary
  } else if (difficultyLevel === "1") {
    if (timeValue) {
      let delta = Date.now() - timeValue;
      chrome.runtime.sendMessage({ action: "timeUpdate", delta, timeType });

      // console.log(timeType, "is", delta);
    }
    timeType = "elementaryTime";
    timeValue = Date.now();
    chrome.runtime.sendMessage({
      action: "tempTimeUpdate",
      timeValue,
      timeType,
    });

    document.getElementById("formName").value = "elementaryForm";
    document
      .getElementById("difficulty-lvl_instructions")
      .classList.add("hidden");
    showElementaryAbstract();

    // Showing the advanced summary
  } else if (difficultyLevel === "2") {
    if (timeValue) {
      let delta = Date.now() - timeValue;
      chrome.runtime.sendMessage({ action: "timeUpdate", delta, timeType });
    }
    timeType = "advancedTime";
    timeValue = Date.now();
    chrome.runtime.sendMessage({
      action: "tempTimeUpdate",
      timeValue,
      timeType,
    });
    document.getElementById("formName").value = "advancedForm";
    document
      .getElementById("difficulty-lvl_instructions")
      .classList.add("hidden");

    showAdvancedAbstract();

    // showing the original abs
  } else if (difficultyLevel === "3") {
    if (timeValue) {
      let delta = Date.now() - timeValue;
      chrome.runtime.sendMessage({ action: "timeUpdate", delta, timeType });

      // console.log(timeType, "is", delta);
    }
    timeType = "originalTime";
    timeValue = Date.now();
    chrome.runtime.sendMessage({
      action: "tempTimeUpdate",
      timeValue,
      timeType,
    });
    document.getElementById("formName").value = "originalForm";
    document
      .getElementById("difficulty-lvl_instructions")
      .classList.add("hidden");

    showOriginalAbstract();
  } else if (difficultyLevel === "4") {
    chrome.runtime.sendMessage({
      action: "tempTimeUpdate",
      timeValue: 0,
      timeType: "",
    });

    document.getElementById("abstract-container").classList.add("hidden");
    document.getElementById("feedbackValue-container").classList.add("hidden");
    document
      .getElementById("difficulty-lvl_instructions")
      .classList.add("hidden");

    document
      .getElementById("feedbackText-container")
      .classList.remove("hidden");
    document.getElementById("feedbackTextForm").classList.remove("hidden");
  }
  updateFeedbackForm();
}
function emptyFeedbackForm() {
  var radios = document.getElementsByName("feedbackValue");

  for (var i = 0; i < radios.length; i++) {
    radios[i].checked = false;
  }
}

function showElementaryAbstract() {
  document.getElementById("feedbackText-container").classList.add("hidden");
  document.getElementById("abstract-container").classList.remove("hidden");
  document.getElementById("feedbackValue-container").classList.remove("hidden");
  document.getElementsByClassName("original-abs")[0].classList.add("hidden");
  document
    .getElementsByClassName("elementary-abs")[0]
    .classList.remove("hidden");
  document.getElementsByClassName("advanced-abs")[0].classList.add("hidden");
  document.getElementsByClassName("original-title")[0].classList.add("hidden");
  document
    .getElementsByClassName("summary-title")[0]
    .classList.remove("hidden");
}
function showAdvancedAbstract() {
  document.getElementById("feedbackText-container").classList.add("hidden");
  document.getElementById("abstract-container").classList.remove("hidden");
  document.getElementById("feedbackValue-container").classList.remove("hidden");
  document.getElementsByClassName("original-abs")[0].classList.add("hidden");
  document.getElementsByClassName("elementary-abs")[0].classList.add("hidden");
  document.getElementsByClassName("advanced-abs")[0].classList.remove("hidden");

  document.getElementsByClassName("original-title")[0].classList.add("hidden");
  document
    .getElementsByClassName("summary-title")[0]
    .classList.remove("hidden");
}
function showOriginalAbstract() {
  document.getElementById("feedbackText-container").classList.add("hidden");
  document.getElementById("abstract-container").classList.remove("hidden");
  document.getElementById("feedbackValue-container").classList.remove("hidden");
  document.getElementsByClassName("original-abs")[0].classList.remove("hidden");
  document.getElementsByClassName("elementary-abs")[0].classList.add("hidden");
  document.getElementsByClassName("advanced-abs")[0].classList.add("hidden");
  document
    .getElementsByClassName("original-title")[0]
    .classList.remove("hidden");
  document.getElementsByClassName("summary-title")[0].classList.add("hidden");
}

function removeElement(elementId) {
  // console.log("removing an element");
  const element = document.getElementById(elementId);
  if (element) {
    element.remove();
  }
}
function updateStudyState() {
  if (state.remainingFeedbacks <= 0) {
    document.getElementById(
      "remaininFeedbacks"
    ).innerHTML = ` <a href="https://docs.google.com/forms/d/e/1FAIpQLSdPUnbrSiH7Q45X-ncwy4O5qZ3M-VD3JcYn7v1L6-coPZcsBA/viewform" target="_blank">Post-Questionnaire</a>`;
  } else {
    document.getElementById("remaininFeedbacks").textContent =
      " " +
      state.remainingFeedbacks +
      (state.remainingFeedbacks <= 1
        ? " Feedback Remaining"
        : " Feedbacks Remaining");
  }
  const dailyPhraseElements = document.getElementsByClassName("dailyPhrase");

  for (let i = 0; i < dailyPhraseElements.length; i++) {
    dailyPhraseElements[i].textContent = state.dailyPhrase;
  }
}
// function hideAbstractsFeedbacks{

// }
