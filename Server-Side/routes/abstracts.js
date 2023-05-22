const express = require("express");
const router = express.Router();
const Abstract = require("../models/abstracts");

// Getting All
router.get("/", async (req, res) => {
  try {
    const abstracts = await Abstract.find();
    res.json(abstracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GETting ONE
router.get("/:id", getAbstract, (req, res) => {
  res.json(res.abstract);
});

// Creating ONE POST
router.post("/", async (req, res) => {
  const abstract = new Abstract({
    url: req.body.url,
    originalAbstract: req.body.originalAbstract,
    elementryAbstract: req.body.elementryAbstract,
    advanceAbstract: req.body.advanceAbstract,
  });
  try {
    const newAbstract = await abstract.save();
    res.status(201).json(newAbstract);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETEing OnE
router.delete("/:id", getAbstract, async (req, res) => {
  try {
    await res.abstract.deleteOne();
    res.json({ message: "Delete Abstract" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
async function getAbstract(req, res, next) {
  let abstract;
  try {
    abstract = await Abstract.findById(req.params.id);
    if (abstract == null) {
      return res.status(404).json({ message: "Cannot find the Abstract" });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
  res.abstract = abstract;
  next();
}
module.exports = router;
