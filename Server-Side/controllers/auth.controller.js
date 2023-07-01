var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var User = require("../models/user");

exports.signup = (req, res) => {
  console.log("req body: ", req.body);
  // const data = JSON.parse(req.body);
  // console.log(req.body.username)
  const user = new User({
    username: req.body.username,
    // name: req.body.name,
    // email: req.body.email,
    // role: req.body.role,
    // password: bcrypt.hashSync(req.body.password, 8),
  });

  user
    .save()
    .then((user) => {
      res.status(200).send({ message: "User registered successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });

  console.log(user);
};

exports.signin = (req, res) => {
  let user = null;
  User.findOne({ username: req.body.username })
    .exec()
    .then((user) => {
      if (!user) {
        // return res.status(404).send({ message: "User not found" });
        // signup(req, res);

        // User.findOne({ username: req.body.username });

        user = new User({
          username: req.body.username,
          // name: req.body.name,
          // email: req.body.email,
          // role: req.body.role,
          // password: bcrypt.hashSync(req.body.password, 8),
        });

        user
          .save()
          .then((user) => {
            // res.status(200).send({ message: "User registered successfully" });
          })
          .catch((err) => {
            // res.status(500).send({ message: err });
          });

        console.log(user);
      }

      // var passwordIsValid = bcrypt.compareSync(
      //   req.body.password,
      //   user.password
      // );

      // if (!passwordIsValid) {
      //   return res
      //     .status(401)
      //     .send({ accessToken: null, message: "Invalid Password" });
      // }

      var token = jwt.sign({ id: user.id }, process.env.API_SECRET, {
        // token expires in 10 days
        expiresIn: 864000,
      });

      res.status(200).send({
        user: { id: user._id, username: user.username },
        message: "Logged In.",
        accessToken: token,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      return;
    });
};
