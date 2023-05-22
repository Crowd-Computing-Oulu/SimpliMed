require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// to solve the cross origin problem
const cors = require("cors");
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to databasse"));
app.use(cors());
app.use(express.json());
const subscribersRouter = require("./routes/subscribers");
app.use("/abstracts", subscribersRouter);
// localhost:3000/subscribers/;
app.listen(3000, () => console.log("Server Started"));
