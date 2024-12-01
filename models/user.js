const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   
    email: {
        type: String,
        required: true,
        unique: true, // Ensure emails are unique
        match: /.+\@.+\..+/ // Basic regex for email validation
    },
   
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)
