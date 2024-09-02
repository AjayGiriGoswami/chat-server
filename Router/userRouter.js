const express = require("express");
const Userdb = require("../Model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodelmailer = require("nodemailer");
const isAuthenticate = require("../Middleware/isauthenticate");

const router = express.Router();

// register
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, password, gender } = req.body;

    if (!fullname) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (!gender) {
      return res.status(400).json({ message: "Gender is required" });
    }
    const user = await Userdb.findOne({ email: email });

    if (user) {
      return res.status(400).json({ message: "Email already exist" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    //  profilePhoto

    const MaleprofilePhoto = `https://avatar.iran.liara.run/public/boy?email=${email}`;
    const FemaleprofilePhoto = `https://avatar.iran.liara.run/public/girl?email=${email}`;

    const newUser = await Userdb.create({
      fullname,
      email,
      password: hashpassword,
      profilePhoto: gender === "male" ? MaleprofilePhoto : FemaleprofilePhoto,
      gender,
    });
    await newUser.save();

    // console.log("User created successfully:", newUser);
    return res
      .status(201)
      .json({ message: "Account Created uccessfully", success: true });
  } catch (error) {
    console.error("Error in register function:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const preuser = await Userdb.findOne({ email: email });
    if (!preuser) {
      return res
        .status(400)
        .json({ message: "User Is Not Exited ! Create Account" });
    }
    const hashpassword = await bcrypt.compare(password, preuser.password);
    if (!hashpassword) {
      return res.status(400).json({ message: "Wrong Password" });
    }
    const tokendata = {
      Userid: preuser._id,
    };
    const token = await jwt.sign(tokendata, process.env.KEY, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      .json({
        _id: preuser._id,
        email: preuser.email,
        fullname: preuser.fullname,
        profilePhoto: preuser.profilePhoto,
        message: "Login Sucessgully!",
        success: "true",
      });
  } catch (error) {
    console.log(error);
  }
});

// Logout
router.get("/logout", (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logout Sucessfully!",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/", isAuthenticate, async (req, res) => {
  try {
    const loggedInUserId = req.id;
    const otherUsers = await Userdb.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    return res.status(200).json(otherUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const preuser = await Userdb.findOne({ email: email });
    if (!preuser) {
      return res.status(400).json({
        message: "Email is Not Existed",
      });
    }
    const token = jwt.sign({ id: preuser._id }, process.env.KEY, {
      expiresIn: "5m",
    });

    var transporter = nodelmailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_GOOGLE,
        pass: process.env.PASSWORD_GOOGLE,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL_GOOGLE,
      to: email,
      subject: "Rest Password Link",
      text: `"Link is Expires in 5 minute "http://localhost:3000/restpassword/${preuser._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).json({
          message: "Email Sent Successfully",
          success: "true",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/restpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  try {
    const decode = await jwt.verify(token, process.env.KEY);
    const id = decode.id;
    const hashpassword = await bcrypt.hash(password, 10);
    await Userdb.findByIdAndUpdate({ _id: id }, { password: hashpassword });
    return res.status(200).json({
      message: "New Password Updated Sucessfully!",
      success: "true",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/verify", isAuthenticate, async (req, res) => {
  res.status(200).json({ message: "success" });
});

module.exports = router;
