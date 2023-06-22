let state = {
  // accessToken: "",
  isLoading: false,
  // abstractData: {
  //   interactionId: "test",
  //   url: "test",
  //   originalTitle: "test",
  //   summerizedTitle: "test",
  //   originalAbstract: "test",
  //   advancedAbstract: "test",
  //   elementaryAbstract: "test",
  // },
  // feedbackData: {
  //   text,
  //   originalDifficulty,
  //   advancedDifficulty,
  //   elementaryDifficulty,
  // },
};
chrome.storage.local.get(["accessToken", "username"], async function (data) {
  state.username = data.username;
  state.accessToken = data.accessToken;
  chrome.runtime.sendMessage({ action: "stateUpdate", state });
});

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("back is working");
  if (message.action === "getAbstractInfromation") {
    if (state.accessToken) {
      // state.accessToken = message.accessToken;
      delete state.abstractData;
      console.log("abstract data is dfs", state.abstractData);
      state.isLoading = true;
      chrome.runtime.sendMessage({ action: "stateUpdate", state });
      state.abstractData = await requestSummary(message.abstractInformation);
      state.isLoading = false;
    }
  } else if (message.action === "login") {
    if (message.username) {
      const accessToken = await requestLogin(message.username);
      state.username = message.username;
      state.accessToken = accessToken;
      chrome.storage.local.set(
        { accessToken: state.accessToken, username: state.username },
        function () {
          console.log("access token saved in storage successfully!");
        }
      );
    }
  } else if (message.action === "logout") {
    chrome.storage.local.remove(["username", "accessToken"], function () {
      state = {};
      // Key-value pairs removed successfully
      // state deleted
    });
  }
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
    accessToken = response.accessToken;
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
// function showLoading(loading) {
//   if (loading) {
//     chrome.runtime.sendMessage({ action: "showLoading" });
//     // document.getElementsByClassName("loader-container")[0].classList.remove("hidden");
//   } else {
//     chrome.runtime.sendMessage({ action: "hideLoading" });
//   }
// }
// function showDifficulty(difficulty) {
//   if (difficulty) {
//     chrome.runtime.sendMessage({ action: "showDifficulty" });
//     // document.getElementsByClassName("loader-container")[0].classList.remove("hidden");
//   } else {
//     chrome.runtime.sendMessage({ action: "hideDifficulty" });
//   }
// }
// function showGetAbstractBtn(abstractBtn) {
//   if (abstractBtn) {
//     console.log("message sent to show the abstract btn");
//     chrome.runtime.sendMessage({ action: "showGetAbstractBtn" });
//   } else {
//     console.log("message sent to hide the abstract btn");

//     chrome.runtime.sendMessage({ action: "hideGetAbstractBtn" });
//   }
// }
