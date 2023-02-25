const jwt = require("jsonwebtoken");

module.exports = authenticate = async (req, res, next) => {
  var token = req.headers.token;
  console.log(token);
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decodedToken) {
      const { email, isAdmin } = decodedToken;
      req.user = { ...req.user, email, isAdmin };
      next();
    } else {
      throw new Error("Invalid Token");
    }
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json("Your session has timedout Or Access Deneid.Please Login!");
  }
};
