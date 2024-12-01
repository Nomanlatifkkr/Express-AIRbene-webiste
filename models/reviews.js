const mongoose = require("mongoose");
const ReviewSchema=new mongoose.Schema({
    comment:String,
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports=mongoose.model("Review",ReviewSchema);