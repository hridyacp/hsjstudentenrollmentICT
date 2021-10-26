const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/StudentDb');
const Schema = mongoose.Schema;
var EmployeeCourseSchema = new Schema({
    coursename:String,
   employeename:String
});
var EmployeeCourseData = mongoose.model('employeecourse', EmployeeCourseSchema);
module.exports = EmployeeCourseData;