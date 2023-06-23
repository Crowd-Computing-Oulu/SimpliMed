let currentTab = "";
let originalText = "";
let originalAbstractHtml = "";
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
    // removing the previous abstract
    document.getElementById("main-content").classList.add("hidden");
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
    } else if (message.action === "showLoading") {
      document
        .getElementsByClassName("loader-container")[0]
        .classList.remove("hidden");
    } else if (message.action === "hideLoading") {
      document
        .getElementsByClassName("loader-container")[0]
        .classList.add("hidden");
      // } else if (message.action === "showDifficulty") {
      //   console.log("show the diffculty in front ");
      //   document.getElementById("difficulty-lvl").classList.remove("hidden");
      // } else if (message.action === "hideDifficulty") {
      //   console.log("hide the diffculty in front ");
      //   document.getElementById("difficulty-lvl").classList.add("hidden");
      // } else if (message.action === "showGetAbstractBtn") {
      //   console.log("show the btn in front ");
      //   document.getElementById("getAbstract").classList.remove("hidden");
      // } else if (message.action === "hideGetAbstractBtn") {
      //   getAbstractBtn.classList.add("hidden");
    }
  });

  // LOGIN
  const loginBtn = document.getElementById("login-form");
  loginBtn.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    console.log("user submited in front");
    chrome.runtime.sendMessage({ action: "login", username });
  });
  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "logout" });
  });

  const rangeInput = document.getElementById("difficulty-lvl__input");

  rangeInput.addEventListener("input", () => {
    // Showing the first lvl difficulty summary
    if (rangeInput.value === "1") {
      // measuring time spent on the Elementary abstract
      // clearInterval(timerInterval); // Clear previous interval to start fresh
      // timerInterval = setInterval(() => {
      //   elementaryTime++; // Increment the Elementary time
      //   console.log(elementaryTime);
      // }, 1000); // Update the elapsed time every second the user is on elementary abstract

      // adding / removing hidden class based on the range inputvalue
      document
        .getElementsByClassName("original-abs")[0]
        .classList.add("hidden");
      document
        .getElementsByClassName("elementary-abs")[0]
        .classList.remove("hidden");
      document
        .getElementsByClassName("advanced-abs")[0]
        .classList.add("hidden");
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
      // clearInterval(timerInterval); // Clear previous interval to start fresh
      // timerInterval = setInterval(() => {
      //   advancedTime++; // Increment the advanced time
      //   console.log(advancedTime);
      // }, 1000); // Update the elapsed time every second the user is on advanced abstract

      document
        .getElementsByClassName("original-abs")[0]
        .classList.add("hidden");
      document
        .getElementsByClassName("elementary-abs")[0]
        .classList.add("hidden");
      document
        .getElementsByClassName("advanced-abs")[0]
        .classList.remove("hidden");
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
      // clearInterval(timerInterval); // Clear previous interval to start fresh
      // timerInterval = setInterval(() => {
      //   originalTime++; // Increment the original time
      //   console.log(originalTime);
      // }, 1000); // Update the elapsed time every second the user is on original abstract

      document
        .getElementsByClassName("original-abs")[0]
        .classList.remove("hidden");
      // document
      //   .getElementsByClassName("title-abstract")[0]
      //   .classList.add("hidden");
      document
        .getElementsByClassName("elementary-abs")[0]
        .classList.add("hidden");
      document
        .getElementsByClassName("advanced-abs")[0]
        .classList.add("hidden");
      document
        .getElementsByClassName("original-title")[0]
        .classList.remove("hidden");
      document
        .getElementsByClassName("summary-title")[0]
        .classList.add("hidden");
    }
  });
  //
  // FEEDBACK
  const elementarySubmitBtn = document.getElementById("elementaryFeedbackBtn");
  const elementaryFeedback = document.getElementById("elementaryFeedback");
  let elementarySliderValue = document.getElementById("elementarySlider").value;
  elementarySliderValue = "";
  document.getElementById("elementarySlider").addEventListener("change", () => {
    elementarySliderValue = document.getElementById("elementarySlider").value;
  });
  elementarySubmitBtn.addEventListener("click", () => {
    if (elementarySliderValue === "") {
      console.log("the input is", elementarySliderValue);
      elementaryFeedback
        .querySelector(".slider-error")
        .classList.remove("hidden");
    } else {
      console.log("user input submited", elementarySliderValue);
      document.getElementById("elementarySlider").classList.add("hidden");
      elementarySubmitBtn.classList.add("hidden");
      elementarySubmitBtn.disabled = true;
      elementaryFeedback.querySelector(".slider-error").classList.add("hidden");
      elementaryFeedback.querySelector(".instruction").classList.add("hidden");
      elementaryFeedback
        .querySelector(".slider-submitted")
        .classList.remove("hidden");
      chrome.runtime.sendMessage({
        action: "submitted",
        elementarySliderValue,
      });
    }
  });

  //
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
