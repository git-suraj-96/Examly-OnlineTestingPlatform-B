const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    institute: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "student"
    },

    newTest: [
        {
            questionID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question'
            },

            testName: {
                type: String,
                default: "None"
            },

            otp: {
                type: Number,
            }
        }
    ],

    finishedTest: {
        obtainedMarks: {
            type: String,
            default: "No Test Yet"
        },

        testName: {
            type: String,
            default: "None"
        },

        finishedDate: {
            type: String,
            default: "None"
        }
    }

})

module.exports = mongoose.model("Student", studentSchema);