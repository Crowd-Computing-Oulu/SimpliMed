chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "popupConnection") {
    port.onDisconnect.addListener(function () {
      console.log("popup has been closed");
      if (tempTimeType) {
        // if (!state.feedback) {
        //   state.feedback = {};
        // }
        let delta = Date.now() - tempTimeValue;
        console.log("delta is", typeof delta);
        // if (!state.feedback[tempTimeType]) {
        //   state.feedback[tempTimeType] = 0;
        // }
        state.feedback[tempTimeType] += delta;
        console.log("time log", delta, tempTimeType);
        console.log(
          "state feedback is",
          state.feedback[tempTimeType],
          state.feedback
        );

        tempTimeType = "";
        tempTimeValue = null;
      }
    });
  }
});

let state = {
  // accessToken: "",
  isLoading: false,
  difficultyLevel: 0,
  instructionShown: false,

  // abstractData: {
  //   interactionId: "test",
  //   url: "test",
  //   originalTitle: "test",
  //   summerizedTitle: "test",
  //   originalAbstract: "test",
  //   advancedAbstract: "test",
  //   elementaryAbstract: "test",
  // },
  feedback: {
    originalTime: 0,
    advancedTime: 0,
    elementaryTime: 0,
  },
  // feedback: {
  //   text,
  //   originalDifficulty,
  //   advancedDifficulty,
  //   elementaryDifficulty,
  //   originalTime,
  //   advancedTime,
  //   elementaryTime,
  // },
};

let tempTimeValue = null;
let tempTimeType = "";
let studyStatus = "";

chrome.storage.local.get(["accessToken", "username"], async function (data) {
  state.username = data.username;
  state.accessToken = data.accessToken;
  await updateStudyStatus();
  chrome.runtime.sendMessage({ action: "stateUpdate", state });
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "getAbstractInfromation") {
    if (state.accessToken) {
      // state.accessToken = message.accessToken;
      delete state.abstractData;
      delete state.feedback;
      state.feedback = { originalTime: 0, advancedTime: 0, elementaryTime: 0 };
      state.instructionShown = true;
      state.isLoading = true;
      chrome.runtime.sendMessage({ action: "stateUpdate", state });
      try {
        state.abstractData = await requestSummary(message.abstractInformation);
      } catch (error) {
        console.log(error.message);
        // showing the error message
        chrome.runtime.sendMessage({
          action: "requestSummaryError",
          err: error.message,
        });
        // show a message
      }
      state.isLoading = false;
    }
  } else if (message.action === "login") {
    if (message.username) {
      const accessToken = await requestLogin(message.username);
      state.username = message.username;
      state.accessToken = accessToken;
      await setChromeStorage();
      console.log("access token saved in storage successfully!");
    }
  } else if (message.action === "logout") {
    await clearChromeStorage();
    state = {
      isLoading: false,
      difficultyLevel: 0,
      instructionShown: false,
      feedback: {
        originalTime: 0,
        advancedTime: 0,
        elementaryTime: 0,
      },
    };
    console.log("the user logged out in back");
    // Key-value pairs removed successfully
    // state deleted
  } else if (message.action === "feedbackValueSubmitted") {
    // if (!state.feedback) {
    //   state.feedback = {};
    // }
    state.feedback[message.feedbackType] = message.feedbackValue;
    console.log("feedback  is", state.feedback);
  } else if (message.action === "sendDifficultyLevel") {
    state.difficultyLevel = message.difficultyLevel;
    console.log("im difficult", state.difficultyLevel);
  } else if (message.action === "feedbackTextSubmitted") {
    // if (!state.feedback) {
    //   state.feedback = {};
    // }
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
        if (state.remainingFeedbacks - 1 == 0) {
          state.feedback.message =
            "Feedback submission was succesfull, you have finished all of your task, please continue the study by going to post-questionnaire";
        } else {
          let message =
            state.remainingFeedbacks - 1 <= 1 ? " Feedback" : " Feedbacks";
          state.feedback.status = "sent";
          state.feedback.message = `Feedback submission was successfull, you have ${
            state.remainingFeedbacks - 1
          }${message} remaining articles to read and submit a feedback!`;
        }
      }
      console.log("i am the result of the esnd feedback", result);
      await updateStudyStatus();
    } else {
      console.log("Please fill the feedback form and values!");
      state.feedback.message = "Please fill the feedback form and values!";
      state.feedback.status = "empty";
    }
  } else if (message.action === "timeUpdate") {
    // if (!state.feedback) {
    //   state.feedback = {};
    // }
    state.feedback[message.timeType] += message.delta;
    // avoiding the loop
    return;
  } else if (message.action === "tempTimeUpdate") {
    tempTimeType = message.timeType;
    tempTimeValue = message.timeValue;
    // console.log("temptimevalue", typeof tempTimeValue);
    return;
  }
  // console.log("state is updateding he");
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
        console.log("this is response", responseData);
        if (response.status == 200) {
          // adding the interactionId in abstractData
          responseData.abstract.interactionID = responseData.interactionId;
          resolve(responseData.abstract);
        } else {
          reject({ message: responseData.message });
        }
        // console.log("this is responseData", responseData);
      } catch (error) {
        reject(error);
      }
    });
  });
}
async function requestStudyStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("accessToken", async function (data) {
      const accessToken = data.accessToken;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "JWT " + accessToken,
        },
        // body: JSON.stringify({
        //   // we are sending the user authentication in server side
        // }),
      };

      try {
        const response = await fetch(
          "http://localhost:8080/study/status",
          options
        );
        console.log(response);
        let responseData = await response.json();
        console.log("this is study status", responseData);
        if (response.status == 200) {
          resolve(responseData);
        } else {
          reject({ message: responseData.message });
        }
        // console.log("this is responseData", responseData);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function sendFeedback(feedback) {
  const {
    elementaryDifficulty,
    advancedDifficulty,
    originalDifficulty,
    text,
    originalTime,
    advancedTime,
    elementaryTime,
  } = feedback;
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
          originalTime,
          advancedTime,
          elementaryTime,
          interactionID: state.abstractData.interactionID,
          abstractID: state.abstractData._id,
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
      async function () {
        await updateStudyStatus();
        resolve();
      }
    );
  });
}

async function updateStudyStatus() {
  let studyStatus = await requestStudyStatus();
  state.numberOfDailyFeedbacks = studyStatus.dailyFeedbacks.length;
  let remainingFeedbacks =
    studyStatus.requiredFeedbacks - studyStatus.dailyFeedbacks.length;
  state.dailyPhrase = studyStatus.dailyPhrase;
  state.remainingFeedbacks = remainingFeedbacks;
  return;
}
