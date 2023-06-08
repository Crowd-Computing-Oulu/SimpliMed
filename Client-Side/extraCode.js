// chrome.storage.local.get("urls", function (data) {
//   (async function () {
//     // Checking the both arguments, To prevent an error for undefined data.urls
//     if (data.urls && data.urls[currentTab.url]) {
//       console.log(
//         "This Abstract have been summarized previously, this is the result"
//       );
//       toggleLoader(false);
//       displayInformation(
//         tabInformation["textTitle"],
//         tabInformation["originalAbs"],
//         data.urls[currentTab.url].summaryElementary,
//         data.urls[currentTab.url].summaryAdvanced,
//         data.urls[currentTab.url].summaryTitle
//       );

//       const responseFromServer = await requestToServer(
//         tabInformation["url"],
//         tabInformation["textTitle"],
//         tabInformation["textToSummarize"]
//       );
//       console.log(
//         "this is responseFrom the server in if",
//         responseFromServer
//       );
//     } else {
//       // if the abstract doesnt exist in the database, we will generate it
//       console.log("this is a new Abstract, which will be summarized soon");
//       // to summarize the text for elementary level
//       // const summarizeElementaryResult = await summarizeTextElementary(
//       //   tabInformation["textToSummarize"],
//       //   OPENAI_TOKEN
//       // );
//       const responseFromServer = await requestToServer(
//         tabInformation["url"],
//         tabInformation["textTitle"],
//         tabInformation["textToSummarize"]
//       );
//       console.log(
//         "this is responseFrom the server in else",
//         responseFromServer
//       );
//       // to summarize the text for advance level

//       // const summarizeAdvancedResult = await summarizeTextAdvanced(
//       //   tabInformation["textToSummarize"],
//       //   OPENAI_TOKEN
//       // );
//       // to summarize the title
//       // const summarizedTitleResult = await summarizeTitle(
//       //   tabInformation["textTitle"],
//       //   OPENAI_TOKEN
//       // );
//       displayInformation(
//         tabInformation["textTitle"],
//         tabInformation["originalAbs"],
//         responseFromServer.abstract["elementaryAbstract"],
//         responseFromServer.abstract["advancedAbstract"],
//         responseFromServer.abstract["summerizedTitle"]
//       );
//       toggleLoader(false);
//     }
//   })();
// });

// ***
// sending request to the server

async function requestToServer(url, title, text) {
  console.log("title is:", title);
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
          originalAbstract: text,
          originalTitle: title,
          url,
        }),
      };

      try {
        const response = await fetch(
          "http://localhost:8080/abstracts/abstract",
          options
        );
        const responseData = await response.json();
        console.log("this is responseData", responseData);

        resolve(responseData);
      } catch (error) {
        reject(error);
      }
    });
  });
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
    // console.log("data urls are ...", data.urls[currentTab.url]);
  });
});

// store in the storage
// chrome.storage.local.get("urls", function (data) {
//   // if the data object doesnt exist, create it
//   if (!data.urls) {
//     data.urls = {};
//     console.log("data object created");
//   }
//   // Check if the URL is already in the data object
//   if (!data.urls[currentTab.url]) {
//     // If the URL isn't in the data object yet, create a new entry
//     data.urls[currentTab.url] = {
//       summaryElementary: summary,
//       summaryAdvanced: summary1,
//       summaryTitle: summarizedTitle,
//     };
//     console.log("new entry added");
//     // saving the data
//     chrome.storage.local.set({ urls: data.urls }, function () {
//       console.log("Data saved successfully!");
//     });
//   } else {
//     console.log("URL already exists in storage.");
//   }
//   chrome.storage.local.get("urls", function (data) {
//     // console.log("data urls are ...", data.urls[currentTab.url]);
//   });
// });
