const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authToken");
const { requestStudyStatus } = require("../controllers/study.controller.js");

router.post("/status", verifyToken, requestStudyStatus);

module.exports = router;
