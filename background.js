chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  const currentTab = tabs[0];
  const tabInformation = await getTabInformation(currentTab);
});

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
    textTitle: doc.getElementsByClassName("heading-title")[0].textContent,
    textToSummarise: doc.querySelectorAll("div.abstract-content p")[0]
      .textContent,
  };

  console.log("text title", tabInformation.textTitle);
  console.log(tabInformation.textToSummarise);

  return tabInformation;
}
