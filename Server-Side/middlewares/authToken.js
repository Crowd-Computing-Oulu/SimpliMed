const jwt = require("jsonwebtoken");
User = require("../models/user");

const verifyToken = (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.API_SECRET,
      function (err, decode) {
        if (err) {
          req.user = undefined;
          res
            .status(500)
            .send({ message: "Authorization failed: Invalid Token" });
        }
        console.log("decode:", decode, "decodeid", decode.id);
        User.findOne({ _id: decode.id })
          .exec()
          .then((user) => {
            req.user = user;
            if (req.user) {
              next();
            } else {
              res
                .status(500)
                .send({ message: "Authorization failed: User not found" });
            }
          })
          .catch((err) => {
            res
              .status(500)
              .send({ message: "Authorization failed: Invalid Token" });
          });
      }
    );
  } else {
    req.user = undefined;
    // next();
    res
      .status(500)
      .send({ message: "Authorization failed, Token is required" });
  }
};
module.exports = verifyToken;
