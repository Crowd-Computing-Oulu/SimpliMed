// const User = require("../models/user");
const Abstract = require("../models/abstract");
const Interaction = require("../models/interaction");
const { sendHttpRequest, sendHttpsRequest } = require("../utils/requestUtils");
// const OPENAI_TOKEN = require("../")

// Delete Later
exports.test = async (req, res) => {
  const MAX_TOKENS = 800;
  // Using Lower Temperature to generate a more predictable text
  const TEMPERATURE = 0.2;
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
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  };

  sendHttpsRequest({
    hostname: "api.openai.com",
    port: 443,
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_TOKEN}`,
    },
    body: JSON.stringify(payload),
  })
    .then((data) => {
      console.log(data.message);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log(req);
  res.status(200).send({ message: "Done" });
};

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
    abstract = new Abstract({
      title: req.body.title,
      url: req.body.url,
      originalAbstract: req.body.originalAbstract,
      advancedAbstract: req.body.advancedAbstract,
      elementaryAbstract: req.body.elementaryAbstract,
    });

    await abstract
      .save()
      .then((anAbstract) => {
        console.log("Created a new Abstract Record.");
      })
      .catch((err) => {
        console.log("Error Creating a new Abstract Record.");
        res.status(500).send({ message: err });
        throw new Error("Abort");
      });
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
      res.status(200).send({ message: "Interaction registered successfully" });
    })
    .catch((err) => {
      console.log("Error Logging Interaction.");
      res.status(500).send({ message: err });
      throw new Error("Abort");
    });
};
