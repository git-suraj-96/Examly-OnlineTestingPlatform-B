const studentModel = require("../models/student");
const userModel = require("../models/user");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signupStudent = async (req, res) => {
  try {
    const { fullName, phone, email, password, institute } = req.body;
    if (!fullName || !phone || !email || !password || !institute)
      return res
        .status(400)
        .json({ success: false, message: "Invalid form data." });
    const user = await userModel.findOne({ email: email });
    if (user)
      return res
        .status(409)
        .json({ success: false, message: "User already exist" });
    const hashedPassword = await bycrypt.hash(password, 10);
    const instituteBelongTo = await userModel.findOne({
      institute: institute.toLowerCase(),
    });

    const demoOtp = -Math.floor(Math.random() * 1000000);
    const newUser = await studentModel.create({
      email,
      fullName,
      phone,
      institute,
      password: hashedPassword,
      role: "student",
      newTest:{otp: demoOtp}
    });
    instituteBelongTo.students.push(newUser._id);
    await instituteBelongTo.save();
    if(instituteBelongTo.teacherQuestionId.length > 0){
      for(let test of instituteBelongTo.teacherQuestionId){
        newUser.newTest.push({questionID :test.questionID, testName: test.testName, otp: test.otp });
      }
      await newUser.save();
    }
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return res
      .status(200)
      .json({ success: true, message: "Register Successfully.", token });
  } catch (err) {
    console.log(err.message);
    console.log(
      "This error is coming from signupStudent and from student.controllers.js file.",
    );
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error.",
        errorTypr: err.message,
      });
  }
};

const getOtp = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(403).json({ success: false, message: "token missing" });
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const student = await studentModel.findOne({ email: decode.email }).populate({
      path: "newTest",
      populate: "questionID"
    });

    return res.status(200).json({ success: true, message: student.newTest });
  } catch (err) {
    console.log(err.message);
    console.log(
      "This error is coming from student.controllers.js and from getQuestion routes.",
    );
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        ErrorType: err.message,
      });
  }
};

const finishedTest = async(req, res) => {
  try{
    const {token, correctMarks, totalMarks, testOtp, date} = req.body;

    if(!token || !date) return res.status(409).json({success: false, message: "Kuch to missed hain.", data: {token, correctMarks, totalMarks, date }}); 

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const {email} = decode;

    const student = await studentModel.findOne({email: email});

    let testNme;

    for(let i = 0; i < student.newTest.length; i++){
      if(student.newTest[i].otp == testOtp){
        testNme = student.newTest[i].testName;
        student.newTest.splice(i, 1);
        break;
      }
    };

    student.finishedTest.obtainedMarks = correctMarks.toString()+"/"+totalMarks.toString();
    student.finishedTest.testName = testNme;
    student.finishedTest.finishedDate = date;
    await student.save();

    return res.status(200).json({success: true, message: "Test has finished successfully."});

  }catch(err){
    console.log(err.message);
    console.log("This error is coming from finishTest route and from student.controllers.js file and from line no 93.");
    return res.status(500).json({success: false, message: "Internal Server Error.", ErrorType: err.message});
  }
};

module.exports = { signupStudent, getOtp, finishedTest };
