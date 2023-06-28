let state = {
  // accessToken: "",
  isLoading: false,
  difficultyLevel: 0,
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
  //   originalTime,
  //   advancedTime,
  //   elementaryTime,
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
      delete state.feedback;
      console.log("abstract data is dfs", state.abstractData);
      state.isLoading = true;
      chrome.runtime.sendMessage({ action: "stateUpdate", state });
      state.abstractData = await requestSummary(message.abstractInformation);
      console.log("state.abstract", state.abstractData);
      state.isLoading = false;
    }
  } else if (message.action === "login") {
    if (message.username) {
      const accessToken = await requestLogin(message.username);
      state.username = message.username;
      state.accessToken = accessToken;
      await setChromeStorage();
      console.log("access token saved in storage successfully!");
      // chrome.storage.local.set(
      //   { accessToken: state.accessToken, username: state.username },
      //   function () {
      //   }
      // );
    }
  } else if (message.action === "logout") {
    await clearChromeStorage();
    state = {};
    console.log("the user logged out in back");
    // Key-value pairs removed successfully
    // state deleted
  } else if (message.action === "feedbackValueSubmitted") {
    if (!state.feedback) {
      state.feedback = {};
    }
    state.feedback[message.feedbackType] = message.feedbackValue;
    console.log("feedback  is", state.feedback);
  } else if (message.action === "sendDifficultyLevel") {
    state.difficultyLevel = message.difficultyLevel;
    console.log("im difficult", state.difficultyLevel);
  } else if (message.action === "feedbackTextSubmitted") {
    if (!state.feedback) {
      state.feedback = {};
    }
    state.feedback.text = message.feedbackText;
    if (
      state.feedback.elementaryDifficulty &&
      state.feedback.advancedDifficulty &&
      state.feedback.originalDifficulty &&
      state.feedback.text
    ) {
      let result = {};
      try {
        result = await sendFeedback(state.feedback);
      } catch (error) {
        result.success = false;
        result.message = "Feedback submission failed!!";
      }
      if (!result.success) {
        state.feedback.status = "failed";
        state.feedback.message = "Feedback submission failed!";
      } else {
        state.feedback.status = "sent";
        state.feedback.message = "Feedback submission was successfull!";
      }
      console.log("i am the result of the esnd feedback", result);
    } else {
      console.log("Please fill the feedback form and values!");
      state.feedback.message = "Please fill the feedback form and values!";
      state.feedback.status = "empty";
    }
  }
  console.log("state is updateding hree");
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
        let responseData = await response.json();
        console.log("this is responseData", responseData);
        // adding the interactionId in abstractData
        responseData.abstract.interactionID = responseData.interactionId;
        resolve(responseData.abstract);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function sendFeedback(feedback) {
  const { elementaryDifficulty, advancedDifficulty, originalDifficulty, text } =
    feedback;
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
          elementaryDifficulty,
          advancedDifficulty,
          originalDifficulty,
          text,
          interactionID: state.abstractData.interactionID,
        }),
      };
      try {
        const response = await fetch(
          "http://localhost:8080/abstracts/submitFeedback",
          options
        );
        const responseData = await response.json();
        console.log("this is feedback", responseData);
        let success = false;
        if (responseData.feedback) {
          success = true;
        }
        resolve({ success, message: responseData.message });
      } catch (error) {
        reject(error);
        // resolve({ success: false, message: "Could not connect to server!" });
      }
    });
  });
}
async function clearChromeStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(["username", "accessToken"], function () {
      resolve();
      // if (chrome.runtime.lastError) {
      //   reject(chrome.runtime.lastError);
      // } else {
      // }
    });
  });
}
async function setChromeStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(
      { accessToken: state.accessToken, username: state.username },
      function () {
        resolve();
      }
    );
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
