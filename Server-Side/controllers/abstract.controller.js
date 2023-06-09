// const User = require("../models/user");
const Abstract = require("../models/abstract");
const Interaction = require("../models/interaction");
const Feedback = require("../models/feedback");

const { sendHttpRequest, sendHttpsRequest } = require("../utils/requestUtils");
const axios = require("axios");

// fetch abstracts
async function fetchResults(text, prompt) {
  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the following abstract, using simplification levels. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. In any case, remember to retain key information in the abstract, but transform all jargon and complicated medical terminology into easier-to-read text, according to the wanted simplification level.",
      },
      {
        role: "user",
        content: `${prompt}: ${text}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 900,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_TOKEN}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error(`Error code: ${response.status}. ${response.data}`);
    }
    const message = response.data.choices[0].message.content;
    let result = { message: message, status: "Ok" };

    console.log("this is the result including message", result);
    return result;
    // const data = response.data;
    // console.log("this suppose to be the response data", data);

    // res.status(200).send({ message: "Done" });
  } catch (error) {
    let result = { status: "Error" };
    return result;
    // console.log(error);
    // res.status(500).send({ error: "Something went wrong" });
  }
}
//

exports.submitFeedback = async (req, res) => {
  // req.body.text
  // req.body.originalDifficulty
  // req.body.originalDifficulty
  const feedback = new Feedback({
    interactionID: req.body.interactionID,
    originalDifficulty: req.body.originalDifficulty,
    advancedDifficulty: req.body.advancedDifficulty,
    elementaryDifficulty: req.body.elementaryDifficulty,
    text: req.body.text,
    originalTime: req.body.originalTime,
    advancedTime: req.body.advancedTime,
    elementaryTime: req.body.elementaryTime,
  });
  await feedback
    .save()
    .then((feedback) => {
      console.log("feedback submitted.");
      res.status(200).send({
        message: "feedback registered successfully",
        feedback,
      });
    })
    .catch((err) => {
      console.log("Error submitting feedback.");
      res.status(500).send({ message: err });
    });
  // res.status(200).send({ message: "Done" });
  return;
};

//
exports.test = async (req, res) => {
  const advancedPrompt =
    " Simplify the following abstract of a medical research article to the general public. The target level of simplification is 8 out of 10. Please ensure that the article retains its main ideas and arguments";
  const elementaryPrompt =
    " Simplify the following abstract of a medical research article to the general public. The target level of simplification is 2 out of 10. Please ensure that the article retains its main ideas and arguments";
  const titlePrompt =
    " Simplify the following title of a medical research article to the general public";

  const advancedResult = await fetchResults(req.body.text, advancedPrompt);
  const elementaryResult = await fetchResults(req.body.text, elementaryPrompt);
  const titleResult = await fetchResults(req.body.title, titlePrompt);

  console.log("result in test", advancedResult, elementaryResult, titleResult);
  res.status(200).send({ message: "Done" });
  return;
  const payload = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the following abstract, using simplification levels. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. In any case, remember to retain key information in the abstract, but transform all jargon and complicated medical terminology into easier-to-read text, according to the wanted simplification level.",
      },
      {
        role: "user",
        content: ` Simplify the following abstract of a medical research article to the general public. The target level of simplification is 8 out of 10. Please ensure that the article retains its main ideas and arguments. ${req.body.text}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 900,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_TOKEN}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error(`Error code: ${response.status}. ${response.data}`);
    }
    const message = response.data.choices[0].message.content;
    const result = { message: message };

    console.log("this is the result including message", result);
    return result;
    // const data = response.data;
    // console.log("this suppose to be the response data", data);

    res.status(200).send({ message: "Done" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong" });
  }
};
////
async function requestResults(req) {
  console.log("the request in server is:", req.body);
  const advancedPrompt =
    "Simplify the following abstract of a medical research article to the general public. The target level of simplification is 8 out of 10. Please ensure that the article retains its main ideas and arguments";
  const elementaryPrompt =
    "Simplify the following abstract of a medical research article to the general public. The target level of simplification is 2 out of 10. Please ensure that the article retains its main ideas and arguments";
  const titlePrompt =
    "Simplify the following sentece. the level should be 3 out of 10";

  const advancedResult = await fetchResults(
    req.body.originalAbstract,
    advancedPrompt
  );
  const elementaryResult = await fetchResults(
    req.body.originalAbstract,
    elementaryPrompt
  );
  const titleResult = await fetchResults(req.body.originalTitle, titlePrompt);

  console.log("result in test", advancedResult, elementaryResult, titleResult);
  // res.status(200).send({ message: "Done" });
  return {
    advancedAbstract: advancedResult.message,
    elementaryAbstract: elementaryResult.message,
    summerizedTitle: titleResult.message,
  };
}
exports.requestAbstract = async (req, res) => {
  console.log("Abstract Requested.");

  let abstract = null;
  await Abstract.findOne({ url: req.body.url })
    .exec()
    .then((anAbstract) => {
      abstract = anAbstract;
      // Checking if the abstract already exist in the databas
      if (anAbstract != null) {
        console.log("Abstract Already Exists. ", abstract);
      }
    })
    .catch((err) => {
      console.log("Abstract Request Error.");
      res.status(500).send({ message: err });
      throw new Error("Abort");
    });
  // Creating a new Abstract Record if it doesnt already exist
  if (abstract == null) {
    console.log("Creating a new Abstract Record.");
    // add api call
    const results = await requestResults(req);
    console.log("this is final results", results);
    //
    abstract = new Abstract({
      url: req.body.url,
      originalTitle: req.body.originalTitle,
      originalAbstract: req.body.originalAbstract,
      summerizedTitle: results.summerizedTitle,
      advancedAbstract: results.advancedAbstract,
      elementaryAbstract: results.elementaryAbstract,
    });

    try {
      await abstract
        .save()
        .then((anAbstract) => {
          console.log("Created a new Abstract Record.");
        })
        .catch((err) => {
          console.log("Error Creating a new Abstract Record.");
          res.status(500).send({
            message:
              "There was an error generating all the content, please try again",
          });
          throw new Error("Abort");
        });
    } catch {
      return; //added to stop the app from crashing
    }
  }

  const interaction = new Interaction({
    userID: req.user.id,
    abstractID: abstract._id,
    originalTime: req.body.originalTime,
    advancedTime: req.body.advancedTime,
    elementaryTime: req.body.elementaryTime,
  });
  // interaction will be saved regardless of the existance of the abstract in databse
  await interaction
    .save()
    .then((interaction) => {
      console.log("Logged Interaction.");
      res.status(200).send({
        message: "Interaction registered successfully",
        abstract,
        interactionId: interaction._id,
      });
    })
    .catch((err) => {
      console.log("Error Logging Interaction.");
      res.status(500).send({ message: err });
      throw new Error("Abort");
    });
};
