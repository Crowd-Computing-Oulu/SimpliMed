let currentTab = "";
let originalText = "";
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
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
      // Throws and error if the user is on the main page
      else if (currentTab.url.endsWith("gov/")) {
        console.log("You need to open an article");
        const mainContentElement =
          document.getElementsByClassName("main-content")[0];
        const lodaerContainerElement =
          document.getElementsByClassName("loader-container")[0];
        lodaerContainerElement.classList.add("hidden");
        mainContentElement.classList.remove("hidden");
        mainContentElement.innerHTML = `<div class="error-message"> You are at the correct website but you need to open an article!</div>`;
      }
      // Throws an error if the user is on the pubmed website but on an incorrect path
      else if (
        currentTab.url.includes("pubmed.ncbi.nlm.nih.gov/trending/") ||
        currentTab.url.includes("pubmed.ncbi.nlm.nih.gov/?term")
      ) {
        console.log("You need to open an article");
        const mainContentElement =
          document.getElementsByClassName("main-content")[0];
        const lodaerContainerElement =
          document.getElementsByClassName("loader-container")[0];
        lodaerContainerElement.classList.add("hidden");
        mainContentElement.classList.remove("hidden");
        mainContentElement.innerHTML = `<div class="error-message"> You are at the correct website but you need to open an article!</div>`;
      }

      // toggleLoader(true);
      // displayInformation("", "");

      const tabInformation = await getTabInformation(currentTab);
      // const responseFromServer = await requestToServer(
      //   tabInformation["url"],
      //   tabInformation["textTitle"],
      //   tabInformation["textToSummarize"]
      // );
      // displayInformation(
      //   tabInformation["textTitle"],
      //   tabInformation["originalAbs"],
      //   responseFromServer.abstract["elementaryAbstract"],
      //   responseFromServer.abstract["advancedAbstract"],
      //   responseFromServer.abstract["summerizedTitle"]
      // );
      // toggleLoader(false);
    }
  );

  // GET ABSTRACT INFORMATION
  const getAbstractBtn = document.getElementById("getAbstract");
  getAbstractBtn.addEventListener("click", async () => {
    const abstractInformation = await getTabInformation(currentTab);
    chrome.runtime.sendMessage({
      action: "getAbstractInfromation",
      abstractInformation,
    });
    getAbstractBtn.classList.add("hidden");
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "stateUpdate") {
      if (message.state.accessToken) {
        document.getElementById("login-container").classList.add("hidden");
        document.getElementById("main-content").classList.remove("hidden");
        if (message.state.abstractData) {
          console.log("am i working");
          document.getElementsByClassName("summary1")[0].textContent =
            message.state.abstractData.advancedAbstract;
        }
      } else {
        document.getElementById("login-container").classList.remove("hidden");
        document.getElementById("main-content").classList.add("hidden");
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
    console.log("user submited in front");
    chrome.runtime.sendMessage({ action: "login", username });
  });

  chrome.runtime.sendMessage({ action: "state" });
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
  // if (!originalAbstractHtml) {
  //   console.log(
  //     "This article doesnt have a valid abstract, please choose another article"
  //   );
  //   alert(
  //     "This article doesnt have a valid abstract, please choose another article"
  //   );
  //   // toggleLoader(false);
  //   throw new Error(
  //     "This Article has no Abstract, please choose another Article."
  //   );
  // }

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
