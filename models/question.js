const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    question: {
        type: Array,
        required: true,
        default: []
    },

   
}, {timestamps: true});

module.exports = mongoose.model("Question", questionSchema);