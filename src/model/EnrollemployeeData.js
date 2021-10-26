const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/StudentDb');
const Schema = mongoose.Schema;
var EnrollEmpSchema = new Schema({
  
     fullname:String ,
     email:String ,
    phone:String ,
     address:String ,
     qualification:String,
     skill:String,
     empstatus:String,
    techtrain:String,
     year:String ,
    empid:String ,
     photo:String ,
     photourl:String,
     confstatus:String
});
var EnrollemployeeData = mongoose.model('enrollempl', EnrollEmpSchema);
module.exports = EnrollemployeeData;