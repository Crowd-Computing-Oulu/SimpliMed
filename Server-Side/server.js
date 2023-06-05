require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user.routes");
const abstractRoutes = require("./routes/abstract.routes");

// to solve the cross origin problem
const cors = require("cors");

// Connect to DB
mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to databasse"));
app.use(cors());
app.use(express.json());
app.use("/abstracts", abstractRoutes);
app.use("/users", userRoutes);

app.listen(3000, () => console.log("Server Started"));
