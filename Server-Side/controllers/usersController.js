var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var User = require("../models/user");
exports.signup = (req, res) => {
  console.log(req.body.password);
  console.log(req.body.name);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  user
    .save()
    .then((user) => {
      res.status(200).send({ message: "User registered successfully" });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
  console.log(user);
};
exports.signin = (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res
          .status(401)
          .send({ accessToken: null, message: "Invalid Password" });
      }
      var token = jwt.sign({ id: user.id }, process.env.API_SECRET, {
        expiresIn: 86400,
      });
      res
        .status(200)
        .send({
          user: { id: user._id, email: user.email, name: user.name },
          message: "Logged In.",
          accessToken: token,
        });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      return;
    });
};
