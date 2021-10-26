const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/StudentDb');
const Schema = mongoose.Schema;
var NewCourseSchema = new Schema({
    courseId:String,
    course:String,
    coursename:String,
    details:String,
    image:String,
    imageurl:String
});
var CourseData = mongoose.model('course', NewCourseSchema);
module.exports = CourseData;