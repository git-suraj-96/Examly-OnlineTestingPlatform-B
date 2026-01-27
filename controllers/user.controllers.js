const userModel = require("../models/user");
const studentModel = require('../models/student');
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleOnLogin = async (req, res) => {
  try {
    const { emailValue, passwordValue, instituteValue, roleValue } = req.body;
    if (!(emailValue && passwordValue && instituteValue && roleValue))
      return res
        .status(400)
        .json({ success: false, message: "Data is missing." });
    let user;
    if(roleValue === "student"){
      user = await studentModel.findOne({email: emailValue});
    }else{
      user = await userModel.findOne({ email: emailValue });
    }
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email or password is wrong" });
    const matchPassword = await bycrypt.compare(passwordValue, user.password);
    if (!matchPassword)
      return res
        .status(401)
        .json({ success: false, message: "Email or password is wrong" });
    if (user.institute !== instituteValue)
      return res
        .status(401)
        .json({ success: false, message: "Email or password is wrong" });
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return res.status(200).json({ success: true, role: user.role, token });
  } catch (err) {
    console.log(err.message);
    console.log(
      "This error is coming from user.controllers.js and from handleLoginRoutes.",
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const allInstitutes = async(req, res) => {
  try{
    const allInstitutes = await userModel.find().select("institute -_id")
    return res.status(200).json({success: true, message: allInstitutes || []});

  }catch (err){
    console.log(err.message);
    console.log("This error is coming from allInstitutes routes and from user.controllers.js file");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    })
  }
};


module.exports = { handleOnLogin, allInstitutes };
