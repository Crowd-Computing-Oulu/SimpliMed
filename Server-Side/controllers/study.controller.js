// const User = require("../models/user");
const Abstract = require("../models/abstract");
const Interaction = require("../models/interaction");
const Feedback = require("../models/feedback");
const { sendHttpRequest, sendHttpsRequest } = require("../utils/requestUtils");
const axios = require("axios");

const study = {
  phases: {
    "2023-06-29": "Test!",
    "2023-06-30": 'Word of the day is "The Bird"',
    "2023-07-01": "What!",
  },
};

exports.requestStudyStatus = async (req, res) => {
  let now = new Date();
  let timeString = now.toISOString().toString().substring(0, 10);
  let today = new Date(timeString);
  let tomorrow = new Date(timeString);
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log(
    "feedbacks between",
    today.toISOString().toString().substring(0, 10),
    "-",
    tomorrow.toISOString().toString().substring(0, 10)
  );
  console.log("todays study", study.phases[timeString]);
  //
  await Feedback.find({ userID: req.user.id })
    .exec()
    .then((feedbacks) => {
      console.log(feedbacks);
      res.status(200).send({ message: "feedbacks", feedbacks });
    })
    .catch((err) => {
      console.log("Error getting user feedbacks.", err);
      res.status(500).send({ message: err });
    });
};
//   const feedback = new Feedback({
//     userID: req.user.id,
//     interactionID: req.body.interactionID,
//     originalDifficulty: req.body.originalDifficulty,
//     advancedDifficulty: req.body.advancedDifficulty,
//     elementaryDifficulty: req.body.elementaryDifficulty,
//     text: req.body.text,
//     originalTime: req.body.originalTime,
//     advancedTime: req.body.advancedTime,
//     elementaryTime: req.body.elementaryTime,
//   });
//   await feedback
//     .save()
//     .then((feedback) => {
//       console.log("feedback submitted.");
//       res.status(200).send({
//         message: "feedback registered successfully",
//         feedback,
//       });
//     })
//     .catch((err) => {
//       console.log("Error submitting feedback.");
//       res.status(500).send({ message: err });
//     });
//   // res.status(200).send({ message: "Done" });
//   return;
