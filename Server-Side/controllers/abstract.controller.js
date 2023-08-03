// const User = require("../models/user");
const Abstract = require("../models/abstract");
const Interaction = require("../models/interaction");
const Feedback = require("../models/feedback");

const { sendHttpRequest, sendHttpsRequest } = require("../utils/requestUtils");
const axios = require("axios");
// const feedback = require("../models/feedback");

// fetch abstracts
async function fetchResults(text, prompt) {
  const payload = {
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You can simplify the text based on different levels of simplification. In this task, you must simplify the given text, using the user's description.",
        // content:
        //   "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the given text, using the user's description .simplification levels. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil.",
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
    return result;
  } catch (error) {
    let result = { status: "Error" };
    return result;
  }
}
//

exports.submitFeedback = async (req, res) => {
  console.log(
    "this is request body -==--==============================================================================================",
    req.body
  );
  // const feedback = new Feedback({
  //   userID: req.user.id,
  //   interactionID: req.body.interactionID,
  //   abstractID: req.body.abstractID,
  //   originalDifficulty: req.body.originalDifficulty,
  //   advancedDifficulty: req.body.advancedDifficulty,
  //   elementaryDifficulty: req.body.elementaryDifficulty,
  //   text: req.body.text,
  //   originalTime: req.body.originalTime,
  //   advancedTime: req.body.advancedTime,
  //   elementaryTime: req.body.elementaryTime,
  // });
  const feedback = new Feedback({
    userID: req.user.id,
    interactionID: req.body.interactionID,
    abstractID: req.body.abstractID,
    originalDifficulty: req.body.originalDifficulty,
    advancedDifficulty: req.body.advancedDifficulty,
    elementaryDifficulty: req.body.elementaryDifficulty,
    onBoardingQuestionnaire: req.body.onBoardingQuestionnaire,
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

////
async function requestResults(req) {
  console.log("the request in server is:", req.body);

  const advancedPrompt =
    "Simplify the following abstract of a medical article while retaining the main idea. The target audience is individuals with an undergraduate university degree. Use language that is understandable for this audience while keeping some technical terms that are not overly complicated. Try not to summerize it. Ensure that the main idea of the original text is preserved without adding any additional information. this is the abstract:";

  const elementaryPrompt =
    "Simplify the following abstract of a medical article while retaining the main idea. The target audience is individuals with an elementary school education degree. Use easy-to-understand language and avoid technical jargon and complex terms. You are allowed to summerize the text, but try not to summerize it too much. Ensure that the main idea of the original text is preserved without adding any additional information.  this is the abstract";

  // const testPrompt =
  //   "Simplify the following abstract of a medical article while retaining the main idea in two different versions for different target groups. use language that is understandble for the target audience.You should ensure that the main idea of the original text is preserved in the simplified versions.the first version should be for target audiance with elementary school degree. you are allowed to summerize the abstract while simplifying it, but try not to summerize it too much. you are allowed simplify the technical terms. the second version should be for target audiance with undergraduate university degree. Try not to summerize the text. you are allowed to keep some technical terms as long as they are not overly complicated. the output and the original abstract should be in one json file. first the first simplified version and then the second simplified version and the last should be the original abstract. this is the abstract:";
  // const elementaryPrompt =
  //   "Simplify the following text, using simplification level 2 out of 10. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. In any case, remember to retain key information in the text, but replace all jargon and complicated medical terminology into easier-to-read text. the vocabulary should be suitable for a kid in elementary level. for instance if the text mentions 'cardiovascular disease,' simplify it to 'heart disease':";

  // const advancedPrompt =
  //   "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the following abstract, using simplification levels. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. In any case, remember to retain key information in the abstract, but transform all jargon and complicated medical terminology into easier-to-read text, according to the wanted simplification level. Simplify the following abstract of a medical research article to the general public. The target level of simplification is 8 out of 10. Please ensure that the article retains its main ideas and arguments";
  // const elementaryPrompt =
  //   "You are an expert science communicator who understands how to simplify scientific text specifically in the medical field. You know how to write so that people from all backgrounds can understand the text. In this task, you must simplify the following abstract, using simplification levels. Simplification level 1 means the output should be as simple as possible, written to an elementary school pupil. In other words, an elementary school pupil should be able to understand what the original text communicates. Simplification level 10 means no simplification, the output text should be exactly the same as the original text. Simplify the following abstract of a medical research article to the general public. The target level of simplification is 2 out of 10. Please ensure that the article retains its main ideas and arguments";
  const titlePrompt = "Simplify the following title:";

  const advancedResult = await fetchResults(
    req.body.originalAbstract,
    advancedPrompt
  );
  const elementaryResult = await fetchResults(
    req.body.originalAbstract,
    elementaryPrompt
  );
  // const testResult = await fetchResults(req.body.originalAbstract, testPrompt);
  const titleResult = await fetchResults(req.body.originalTitle, titlePrompt);

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
              "There was an error generating all the content, please try again!",
          });
          throw new Error("Abort");
        });
    } catch {
      return; //added to stop the app from crashing
    }
  }

  // Check if there is any feedback for this abstract id or not
  let feedback = null;
  await Feedback.findOne({ abstractID: abstract._id, userID: req.user.id })
    .exec()
    .then((aFeedback) => {
      feedback = aFeedback;
      // Checking if the abstract already has a feedback with this user id
      if (aFeedback != null) {
        console.log("feedback Already Exists. ", feedback);
      }
    })
    .catch((err) => {
      console.log("Feedback Request Error.");
      // res.status(500).send({ message: err });
      // throw new Error("Abort");
    });
  //
  const interaction = new Interaction({
    userID: req.user.id,
    abstractID: abstract._id,
    originalTime: req.body.originalTime,
    advancedTime: req.body.advancedTime,
    elementaryTime: req.body.elementaryTime,
  });
  // interaction will be saved regardless of the existance of the abstract in database
  await interaction
    .save()
    .then((interaction) => {
      console.log("Logged Interaction.");
      res.status(200).send({
        message: "Interaction registered successfully",
        abstract,
        feedback,
        interactionId: interaction._id,
      });
    })
    .catch((err) => {
      console.log("Error Logging Interaction.");
      res.status(500).send({ message: err });
      throw new Error("Abort");
    });
};
