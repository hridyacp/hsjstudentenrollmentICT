const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/StudentDb');
const Schema = mongoose.Schema;
var NewSignupSchema = new Schema({
    fname: String,
    lname: String,
mobnumber: String,
designation: String,
email: String,
password: String,
confirmpwd: String,
regid: String,
confstatus: String
});
var SignupData = mongoose.model('signup', NewSignupSchema);
module.exports = SignupData;