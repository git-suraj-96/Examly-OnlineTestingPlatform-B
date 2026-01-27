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
                required: true
            },

            otp: {
                type: Number,
                required: true,
                unique: true
            }
        }
    ],

    finishedTest: {
        obtainedMarks: {
            type: String
        },

        testName: {
            type: String
        },

        finishedDate: {
            type: String
        }
    }

})

module.exports = mongoose.model("Student", studentSchema);