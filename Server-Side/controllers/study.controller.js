// const User = require("../models/user");
const Abstract = require("../models/abstract");
const Interaction = require("../models/interaction");
const Feedback = require("../models/feedback");
// const { sendHttpRequest, sendHttpsRequest } = require("../utils/requestUtils");
const axios = require("axios");
const study = require("../study/studyStatus.json");

// const study = {
//   phases: {
//     "2023-07-03": {
//       phrase: "An apple a day, keeps the cancer away!",
//       requiredFeedbacks: 2,
//     },
//     "2023-07-04": {
//       phrase: "An apple a day, keeps the cancer away!",
//       requiredFeedbacks: 2,
//     },
//     "2023-07-05": { phrase: "Water Skin", requiredFeedbacks: 6 },
//   },
// };
exports.requestStudyStatus = async (req, res) => {
  let isCompleted = true;
  for (const [key, value] of Object.entries(study.phases)) {
    let date = new Date(key);
    let nextDate = new Date(key);
    nextDate.setDate(nextDate.getDate() + 1);
    await Feedback.find({
      userID: req.user.id,
      created: { $gte: date, $lt: nextDate },
    })
      .exec()
      .then((dailyFeedbacks) => {
        if (dailyFeedbacks.length >= value.requiredFeedbacks) {
        } else {
          isCompleted = false;
        }

        // console.log(dailyFeedbacks);
        // res.status(200).send({
        //   message: "dailyFeedbacks",
        //   dailyFeedbacks,
        //   dailyPhrase,
        //   requiredFeedbacks,
        // });
      });
  }

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
  console.log("todays study", study.phases[timeString].phrase);
  let requiredFeedbacks = 0;
  let dailyPhrase = "Study duration has ended!";
  if (study.phases[timeString]) {
    dailyPhrase = study.phases[timeString].phrase;
    requiredFeedbacks = study.phases[timeString].requiredFeedbacks;
  }
  //
  await Feedback.find({
    userID: req.user.id,
    created: { $gte: today, $lt: tomorrow },
  })
    .exec()
    .then((dailyFeedbacks) => {
      console.log(dailyFeedbacks);
      res.status(200).send({
        message: "dailyFeedbacks",
        dailyFeedbacks,
        dailyPhrase,
        requiredFeedbacks,
        isCompleted,
      });
    })
    .catch((err) => {
      console.log("Error getting user daily feedbacks.", err);
      res.status(500).send({ message: err });
    });
};
