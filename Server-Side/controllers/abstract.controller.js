const User = require("../models/user");
const Abstract = require("../models/abstract");
const Interaction = require("../models/interaction");

exports.requestAbstract = async (req, res) => {
  console.log("Abstract Requested.");

  abstract = null;
  await Abstract.findOne({ url: req.body.url })
    .exec()
    .then((anAbstract) => {
      abstract = anAbstract;
      if (anAbstract != null) {
        console.log("Abstract Already Exists. ", abstract);
      }
    })
    .catch((err) => {
      console.log("Abstract Request Error.");
      res.status(500).send({ message: err });
      throw new Error("Abort");
    });

  if (abstract == null) {
    console.log("Creating a new Abstract Record.");
    // ....add api call
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
