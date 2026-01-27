const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true,
    },

    password:{
        type: String,
        required: true
    },

    institute: {
        type: String,
        required: true,
    },

    role:{
        type: String,
        default: "teacher",
        required: true,
    },
    teacherQuestionId: [
        {
            questionID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            },

            testName: {
                type: String,
            },

            otp: {
                type: Number,
            }

        }
    ],

    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],

    payment: {
        type: String,
        default: "pending"
    }
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);