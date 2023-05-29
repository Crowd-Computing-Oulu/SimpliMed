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
const abstractsRouter = require("./routes/abstracts");
app.use("/abstracts", abstractsRouter);
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

app.listen(3000, () => console.log("Server Started"));
