const userModel = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const questionModel = require('../models/question');
const crypto = require('crypto');
const studentModel = require('../models/student');
var Razorpay = require("razorpay");
var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});



const handleTeacherSetQuestion = async (req, res) => {
    try {
        const { questionBank, questionTopic, token } = req.body;
        if (!questionBank || !questionTopic || !token) return res.json(400).json({ success: false, message: "Data Missing" });
        const decode =  jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decode;
        const user = await userModel.findOne({ email: email });
        if (!user) return res.status(403).json({ success: false, message: "Unauthorized Access" });
        if (user.payment === "pending") return res.status(402).json({ success: false, message: "You can not set Question.\nYour Payment is Pending." })

        const questionVerificationOtp = crypto.randomInt(100000, 999999);

        const setQuestion = await questionModel.create({
            owner: user._id,
            question: questionBank,
        });

        user.teacherQuestionId.push({ questionID: setQuestion._id, testName: questionTopic, otp: questionVerificationOtp });
        await user.save();

        for (let val of user.students) {
            let student = await studentModel.findOne({ _id: val });
            student.newTest.push({ questionID: setQuestion._id, testName: questionTopic, otp: questionVerificationOtp });
            await student.save();
        }

        user.payment = "pending";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "All set"
        })
    } catch (err) {
        console.log(err.message);
        if (err.message === "jwt expired") return res.json({ success: false, message: "jwt expired" });
        console.log("This error is coming from HandleTeacherSetQuestion.");
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errorType: err.message
        })
    }
};

const signupNewInstitute = async (req, res) => {
    try {
        let { fullNameValue, emailValue, passwordValue, phoneValue, instituteValue } = req.body;
        if (!(fullNameValue && emailValue && passwordValue && phoneValue && instituteValue)) return res.status(400).json({ success: false, message: "Something is missing" });
        const userExist = await userModel.findOne({ email: emailValue });
        if (userExist) return res.status(409).json({ success: false, message: "User already exist." });
        instituteValue = instituteValue.toLowerCase();
        const hashedPassword = await bcrypt.hash(passwordValue, 10);
        const createdUser = await userModel.create({
            email: emailValue,
            fullName: fullNameValue,
            password: hashedPassword,
            phone: phoneValue,
            role: "teacher",
            institute: instituteValue,
            payment: "paid"
        });

        if (createdUser) {
            return res.status(200).json({ success: true, message: "New Institute Registered Successfully." });
        } else {
            return res.status(500).json({ success: false, message: "Internal Server Error." });
        }

    } catch (err) {
        console.log(err.message);
        console.log("Error is coming from teacher.controllers.js and from signupNewInstitute.")
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const testDetails = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(404).json({ success: false, message: "Token Missing" });
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decode.email }).populate({
            path: "students"
        });
        if (!user) return res.status(401).json({ success: false, message: "User not authorized" });
        const allStudents = user.students;

        return res.status(200).json({ success: true, message: user.teacherQuestionId, allStudents });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", ErrorType: err.message });
    }
};

const testFinished = async (req, res) => {

    try {

        const { token, testCode } = req.body;

        if (!token || !testCode) return res.status(401).json({ success: false, message: "Token is missing" });

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decode;

        const teacher = await userModel.findOne({ email: email });
        if (!teacher) return res.status(404).json({ success: false, message: "User not found" });

        let questionId;

        for (let i = 0; i < teacher.teacherQuestionId.length; i++) {
            if (teacher.teacherQuestionId[i].otp == testCode) {
                questionId = teacher.teacherQuestionId[i].questionID;
                teacher.teacherQuestionId.splice(i, 1);
                await teacher.save();

                for (let student of teacher.students) {
                    let s = await studentModel.findOne({ _id: student });
                    for (let j = 0; j < s.newTest.length; j++) {
                        if (s.newTest[j].otp == testCode) {
                            s.newTest.splice(j, 1);
                            await s.save();
                            break;
                        }
                    }
                }
            }
        };

        if (!questionId) return res.status(200).json({ success: true, message: "Test details has already Updated." })

        const deletedQuestion = await questionModel.findByIdAndDelete({ _id: questionId });


        if (deletedQuestion) {
            return res.status(200).json({
                success: true, message: "Thanks for updating test details.", deletedQuestion
            })
        } else {
            res.status(500).json({
                success: false, message: "Internal Server Error.."
            })
        }
    } catch (err) {
        console.log(err.message);
        console.log("This error is coming from testFinished routes and from teacher.controllers.js file and fro line no 141.");
        return res.status(500).json({ success: false, message: "Internal Server Error..", ErrorType: err.message });
    }
};

const createOrder = async (req, res) => {
    const options = {
        amount: req.body.amount * 100, // convert to paise
        currency: "INR",
        receipt: "receipt" + Date.now(),
    };

    try {
        const order = await razorpay.orders.create(options);
        return res.json(order); // send order_id to frontend
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {response, token} = req.body;

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature}  = response;

        if(!token) return res.status(401).json({success: false, message: "Token is missing"});
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({success: false, message: "Missing Required Parameters"});

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const {email} = decode;

        const teacher = await userModel.findOne({email: email});

        // Create string to sign
        const signString = razorpay_order_id + "|" + razorpay_payment_id;

        // Create signature using secret key
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signString)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            teacher.payment = "paid";
            await teacher.save();
            return res.json({
                success: true,
                message: "success",
            });
            
        } else {
            return res.json({
                success: false,
                message: 'fail',
            })
        }

    } catch (err) {
        console.log(err.message);
        console.log("This error is coming from VerifyPayment routes and from teacher.controllers.js file and from line no 182.");
        return res.status(500).json({
            success: false,
            message: "Intrernal Server Error..",
            ErrorType: err.message
        })
    }
};

module.exports = { handleTeacherSetQuestion, signupNewInstitute, testDetails, testFinished, createOrder, verifyPayment };