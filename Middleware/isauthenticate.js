const jwt = require("jsonwebtoken");
const Userdb = require("../Model/UserModel");

const isAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const decoded = await jwt.verify(token, process.env.KEY);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await Userdb.findById(decoded.Userid);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.id = user; // Set req.user with the logged-in user's data
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = isAuthenticate;
