let currentTab = "";
let originalText = "";
let originalAbstractHtml = "";
let state = {};
// let difficultyLevel = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Close the popup window
  document.getElementById("closeBtn").addEventListener("click", function () {
    window.close();
  });
  const mainContentElement = document.getElementsByClassName("main-content")[0];
  const loaderContainerElement =
    document.getElementsByClassName("loader-container")[0];
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      currentTab = tabs[0];
      const regex = /^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/;
      // To check if the URL is correct (containing this string)
      if (currentTab.url.indexOf("pubmed.ncbi.nlm.nih.gov") === -1) {
        document.getElementById("getAbstract").classList.add("hidden");
        mainContentElement.innerHTML = `<div class="error-message">This Website is not supported by the extension!</div>`;
      } else if (!regex.test(currentTab.url)) {
        document.getElementById("getAbstract").classList.add("hidden");
        mainContentElement.innerHTML = `<div class="error-message">You are on the correct website, but you need to open an article</div>`;
      }
      const tabInformation = await getTabInformation(currentTab);
    }
  );

  // GET ABSTRACT INFORMATION
  const getAbstractBtn = document.getElementById("getAbstract");
  getAbstractBtn.addEventListener("click", async () => {
    // removing the previous abstract with feedback form
    document.getElementById("main-content").classList.add("hidden");
    document.getElementById("feedbackValue-container").classList.add("hidden");

    // removing the difficulty section
    // document.getElementById("difficulty-lvl").classList.add("hidden");

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
      console.log("the state is,", state);
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
        // if there is no access token, the user will see the login section
        document.getElementById("login-container").classList.remove("hidden");
        document.getElementById("main-content").classList.add("hidden");
        document.getElementById("getAbstract").classList.add("hidden");
        document.getElementById("header").classList.add("hidden");
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
    } else if (message.action === "showLoading") {
      document
        .getElementsByClassName("loader-container")[0]
        .classList.remove("hidden");
    } else if (message.action === "hideLoading") {
      document
        .getElementsByClassName("loader-container")[0]
        .classList.add("hidden");
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
    chrome.runtime.sendMessage({ action: "logout" });
  });

  const difficultyLvlInput = document.getElementById("difficulty-lvl__input");
  if (difficultyLvlInput.value === "0") {
    document.getElementById("abstract-container").classList.add("hidden");
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
    // toggleLoader(false);
    throw new Error(
      "This Article has no Abstract, please choose another Article."
    );
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
  console.log("am i working??");
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
      console.log("am i working?");
    } else {
      document.getElementById("feedbackValueForm").classList.remove("hidden");
      document.getElementById("result").classList.add("hidden");
      console.log("am i working?");
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
  // Showing the first lvl difficulty summary
  if (difficultyLevel === "0") {
    document.getElementById("abstract-container").classList.add("hidden");
    document.getElementById("feedbackValue-container").classList.add("hidden");
    document.getElementById("feedbackText-container").classList.add("hidden");
  } else if (difficultyLevel === "1") {
    // measuring time spent on the Elementary abstract
    // clearInterval(timerInterval); // Clear previous interval to start fresh
    // timerInterval = setInterval(() => {
    //   elementaryTime++; // Increment the Elementary time
    //   console.log(elementaryTime);
    // }, 1000); // Update the elapsed time every second the user is on elementary abstract
    document.getElementById("formName").value = "elementaryForm";
    showElementaryAbstract();

    // Showing the second lvl difficulty summary
  } else if (difficultyLevel === "2") {
    // measuring time spent on the advanced abstract
    // clearInterval(timerInterval); // Clear previous interval to start fresh
    // timerInterval = setInterval(() => {
    //   advancedTime++; // Increment the advanced time
    //   console.log(advancedTime);
    // }, 1000); // Update the elapsed time every second the user is on advanced abstract
    document.getElementById("formName").value = "advancedForm";
    showAdvancedAbstract();

    // showing the original abs
  } else if (difficultyLevel === "3") {
    // measuring time spent on the original abstract
    // clearInterval(timerInterval); // Clear previous interval to start fresh
    // timerInterval = setInterval(() => {
    //   originalTime++; // Increment the original time
    //   console.log(originalTime);
    // }, 1000); // Update the elapsed time every second the user is on original abstract
    document.getElementById("formName").value = "originalForm";
    showOriginalAbstract();
  } else if (difficultyLevel === "4") {
    document.getElementById("abstract-container").classList.add("hidden");
    document.getElementById("feedbackValue-container").classList.add("hidden");
    document
      .getElementById("feedbackText-container")
      .classList.remove("hidden");
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
// function hideAbstractsFeedbacks{

// }
