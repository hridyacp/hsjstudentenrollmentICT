const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/StudentDb');
const Schema = mongoose.Schema;
var EnrollStudentSchema = new Schema({
    fullname:String,
    email:String,
    phone:String,
    address:String,
    place:String,
    qualification:String,
    passout:String,
    skill:String,
    empstatus:String,
    techtrain:String,
    year:String,
    course:String,
    // fee:String,
    studcardnumber:String,
    studedate:String,
    studcsc:String,
    studid:String,
    photo:String,
    photourl:String,
    confstatus:String
});
var EnrollstudentData = mongoose.model('enrollstud', EnrollStudentSchema);
module.exports = EnrollstudentData;