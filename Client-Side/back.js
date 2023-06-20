let state = {
  // accessToken: "",
  abstractData: {
    interactionId: "test",
    url: "test",
    originalTitle: "test",
    summerizedTitle: "test",
    originalAbstract: "test",
    advancedAbstract: "test",
    elementaryAbstract: "test",
  },
  // feedbackData: {
  //   text,
  //   originalDifficulty,
  //   advancedDifficulty,
  //   elementaryDifficulty,
  // },
};
chrome.storage.local.get("accessToken", async function (data) {
  if (data.accessToken) {
    showGetAbstractBtn(true);
  }
  state.accessToken = data.accessToken;
  chrome.runtime.sendMessage({ action: "stateUpdate", state });
});

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("back is working");
  if (message.action === "getAbstractInfromation") {
    if (state.accessToken) {
      // state.accessToken = message.accessToken;
      showLoading(true);
      state.abstractData = await requestSummary(message.abstractInformation);
      console.log("this is state", state);
      showLoading(false);
      showDifficulty(true);
    }
  } else if (message.action === "login") {
    if (message.username) {
      const accessToken = await requestLogin(message.username);
      state.accessToken = accessToken;
      chrome.storage.local.set({ accessToken: state.accessToken }, function () {
        console.log("access token saved in storage successfully!");
      });
    }
  }
  // else if(){

  // }
  chrome.runtime.sendMessage({ action: "stateUpdate", state });
});

async function requestLogin(username) {
  console.log(username);
  let accessToken = "";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  };
  try {
    var response = await fetch("http://localhost:8080/users/login", options);
    response = await response.json();
    // response = response.choices[0].message.content.trim();
    accessToken = response.accessToken;
    console.log("rseponse msg is", response);
    console.log("access token msg is", accessToken);
  } catch (error) {
    console.log(error);
  }
  return accessToken;
}
async function requestSummary(abstractInfromation) {
  const { url, originalTitle, originalAbstract } = abstractInfromation;
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("accessToken", async function (data) {
      const accessToken = data.accessToken;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "JWT " + accessToken,
        },
        body: JSON.stringify({
          originalAbstract: originalAbstract,
          originalTitle: originalTitle,
          url: url,
        }),
      };

      try {
        const response = await fetch(
          "http://localhost:8080/abstracts/abstract",
          options
        );
        const responseData = await response.json();
        console.log("this is responseData", responseData);
        resolve(responseData.abstract);
      } catch (error) {
        reject(error);
      }
    });
  });
}
function showLoading(loading) {
  if (loading) {
    chrome.runtime.sendMessage({ action: "showLoading" });
    // document.getElementsByClassName("loader-container")[0].classList.remove("hidden");
  } else {
    chrome.runtime.sendMessage({ action: "hideLoading" });
  }
}
function showDifficulty(difficulty) {
  if (difficulty) {
    chrome.runtime.sendMessage({ action: "showDifficulty" });
    // document.getElementsByClassName("loader-container")[0].classList.remove("hidden");
  } else {
    chrome.runtime.sendMessage({ action: "hideDifficulty" });
  }
}
function showGetAbstractBtn(abstractBtn) {
  if (difficulty) {
    chrome.runtime.sendMessage({ action: "showGetAbstractBtn" });
  } else {
    chrome.runtime.sendMessage({ action: "hideGetAbstractBtn" });
  }
}
