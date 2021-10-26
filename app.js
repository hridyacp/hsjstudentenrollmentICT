const express = require('express');
const CourseData = require('./src/model/CourseData');
const SignupData = require('./src/model/SignupData');
const EmployeeCourseData = require('./src/model/EmployeeCourseData');
const EnrollemployeeData = require('./src/model/EnrollemployeeData');
const EnrollstudentData = require('./src/model/EnrollstudentData');
const cors = require('cors');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const { parseConnectionUrl } = require('nodemailer/lib/shared');
//const EnrollstudentData = require('./src/model/EnrollstudentData');
var app = new express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
username="admin@ictak.in";
passwords="Abcde123@";
var role
var addnew
let totaldocs
let totaldocstud
let idnew
let idemp
let idnews
let idemps
let emailerrors
let emailerror
function verifyToken(req,res,next){
    if(!req.headers.authorization){
       return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if(token=='null'){
        return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token,'secretKey')
    
    if(!payload){
        return res.status(401).send('Unauthorized request')
    }
    req.userId= payload.subject
    next()
    }
    //login
app.post('/login',function(req,res){
    email=req.body.email;
    password=req.body.password;
    if(username==email && passwords==password){
        let payload={subject:email+password};
        let token=jwt.sign(payload,'secretKey');
        let role="admin"
        res.status(200).send({token,role});
    }
    else {
    SignupData.findOne({email:email,password:password}, function (err, user) {
        if(!user){
            res.status(401).send('Email and Password dont match') 
        }
        else {
             if (user.designation=="Student" && user.confstatus==""){
                 let role="newstudent"
                 let payload={subject:email+password};
                 let token=jwt.sign(payload,'secretKey');
                res.status(200).send({token,role});
             }
             else if (user.designation=="Student" && user.confstatus=="confirm"){
                let role="student"
                 let payload={subject:email+password};
                 let token=jwt.sign(payload,'secretKey');
                 res.status(200).send({token,role});
             }
             else if (user.designation=="Employee" && user.confstatus==""){
                 let role="newemployee"
                 let payload={subject:email+password};
                 let token=jwt.sign(payload,'secretKey');
                res.status(200).send({token,role});
             }
             else if (user.designation=="Employee" && user.confstatus=="confirm"){
                let role="employee"
                 let payload={subject:email+password};
                let token=jwt.sign(payload,'secretKey');
                 res.status(200).send({token,role});
             }
             else if (user.confstatus=="pending"){
                let role="notifywait"
                let payload={subject:email+password};
                let token=jwt.sign(payload,'secretKey');
               res.status(200).send({token,role});
            }
            }
    });
}
})
//display course
app.get('/course',function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
   CourseData.find()
    .then(function(course){
        res.send(course);
    });
});
//sign up data store
app.post('/signupnew',function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    console.log(req.body);
    var signup=
        {
            fname:req.body.signup.fname,
            lname:req.body.signup.lname,
            mobnumber:req.body.signup.mobnumber,
            designation:req.body.signup.designation,
           email:req.body.signup.email,
           password:req.body.signup.password,
           confirmpwd:req.body.signup.confirmpwd,
           regid:"",
           confstatus:req.body.signup.confstatus
        }
        email=req.body.signup.email;
        SignupData.findOne({email:email}, function (err, user) {
            if (user) {
                res.status(401).send('Email already exists')   
            }
            else{
               newsignup = new SignupData(signup);
              newsignup.save();
              console.log(req.body);
              res.status(200).send();
            }
        });
  });
  //show total employees list to assign
  app.get('/employee',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  EnrollemployeeData.find({confstatus:"confirm"})
    .then(function(employees){
        res.send(employees);
    });
});
app.get('/student',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  EnrollstudentData.find({confstatus:"confirm"})
    .then(function(students){
        res.send(students);
    });
});
//dispaly student dashboard
app.get('/singlestudentprofile/:id',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  email=req.params.id
  console.log(email)
    EnrollstudentData.findOne({"email":email})
    .then(function(studentdatas){
        res.send(studentdatas)
});
});
//displayemployees after assignment of course
app.get('/dispemployees/:id',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.params.id;
    CourseData.findOne({"_id":id})
    .then((course)=>{
        coursename=course.coursename
        EmployeeCourseData.find({coursename:coursename})
        .then(function(dispemployeesval){
            res.send(dispemployeesval);
        });
    })
   
});
//dispaly courses of employees
app.get('/dispcourseemployee/:id',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    employeeId=req.params.id
    EnrollemployeeData.findById(employeeId)
    .then((employee)=>{
    employeename=employee.fullname
   EmployeeCourseData.find({employeename:employeename})
    .then(function(dispemployeesvalue){
        res.send(dispemployeesvalue);
        console.log(dispemployeesvalue)
    });
});
});
//dispaly course of employee in profile
app.get('/dispcourseemployeeprofile/:id',verifyToken,function(req,res){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
 empemailid=req.params.id
 console.log(empemailid)
  EnrollemployeeData.findOne({"email":empemailid})
  .then((employee)=>{
  employeename=employee.fullname
 EmployeeCourseData.find({employeename:employeename})
  .then(function(dispemployeesvalue){
      res.send(dispemployeesvalue);
  });
});
});
//update student data profile
app.put('/updatestudents',verifyToken,(req,res)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  id=req.body._id
  email=req.body.email
  studid=req.body.studid
 console.log(id)
 SignupData.findOne({email:email}, function (err, user) {
  if (user) {
    if(user.regid==studid){
      EnrollstudentData.findByIdAndUpdate({"_id":id},
      {$set:{  "phone":req.body.phone,
        "address":req.body.address,
        "place":req.body.place,
        "qualification":req.body.qualification,
        "passout":req.body.passout,
        "skill":req.body.skill,
        "empstatus":req.body.empstatus,
        "techtrain":req.body.techtrain,
        "year":req.body.year,
       "photo":req.body.photo,
    "photourl":req.body.photourl}})  
    .then(function(){
      res.status(200).send();
      }) 
    }
    else{
      res.status(401).send({emailerrors})   
    }
  }
  else{
 SignupData.findOneAndUpdate({"regid":studid},
 {$set:{ "email": email
    }})
    .then()
  EnrollstudentData.findByIdAndUpdate({"_id":id},
  {$set:{  "email":req.body.email,
    "phone":req.body.phone,
    "address":req.body.address,
    "place":req.body.place,
    "qualification":req.body.qualification,
    "passout":req.body.passout,
    "skill":req.body.skill,
    "empstatus":req.body.empstatus,
    "techtrain":req.body.techtrain,
    "year":req.body.year,
   "photo":req.body.photo,
"photourl":req.body.photourl}})  
.then(function(){
  res.send();
  })  
}
 }) 
});
//update employee profile
app.put('/editempprofiles',verifyToken,(req,res)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  id=req.body._id
  email=req.body.email
  empid=req.body.empid
  SignupData.findOne({email:email}, function (err, user) {
    if (user) {
      if(user.regid==empid){
        EnrollemployeeData.findByIdAndUpdate({"_id":id},
  {$set:{ 
    "phone":req.body.phone,
    "address":req.body.address,
    "qualification":req.body.qualification,
    "skill":req.body.skill,
    "empstatus":req.body.empstatus,
    "techtrain":req.body.techtrain,
    "year":req.body.year,
   "photo":req.body.photo,
"photourl":req.body.photourl}})  
.then(function(){
  res.status(200).send();
  })   
      }
      else{
        res.status(401).send({emailerror})   
      }
        
    }
    else{
 SignupData.findOneAndUpdate({"regid":empid},
 {$set:{ "email": email
    }})
    .then()
  EnrollemployeeData.findByIdAndUpdate({"_id":id},
  {$set:{  "email":req.body.email,
    "phone":req.body.phone,
    "address":req.body.address,
    "qualification":req.body.qualification,
    "skill":req.body.skill,
    "empstatus":req.body.empstatus,
    "techtrain":req.body.techtrain,
    "year":req.body.year,
   "photo":req.body.photo,
"photourl":req.body.photourl}})  
.then(function(){
  res.send();
  })   
}
  })
});
// employee_profile

app.get('/singleemployeedet/:id',verifyToken, (req, res) => {
  const id = req.params.id;
  console.log(id)
   EnrollemployeeData.findOne({"email":id})
    .then((employee)=>{
        res.send(employee);
    });
})
 //deny complete employee data 
 app.delete('/removeempden/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    ids = req.params.id;
    console.log(ids)
        EnrollemployeeData.findOne({'_id':ids})
        .then((employeedenied)=>{
        emailid=employeedenied.email
        console.log(emailid)
        SignupData.deleteOne({'email':emailid})
        .then()
        EnrollemployeeData.deleteOne({'_id':ids})
        .then()
        res.send();
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hridscp123@gmail.com',
              pass: 'Jith1234#'
            }
          });
          
          var mailOptions = {
            from: 'hridscp123@gmail.com',
            to: emailid,
            subject: 'Enrollment mail',
            text: "Greeting from ICT Academy of Kerala, unfortunately your enrollment has been denied. For further details please contact ICT academy"
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
              res.render("welcomes",{
                 fname:req.query.names
              });  
        })
  })

  //deny student
 app.delete('/removestudentden/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    idstud = req.params.id;
    console.log(idstud)
   EnrollstudentData.findOne({'_id':idstud})
   .then((studentsden)=>{
    emailstud= studentsden.email
    SignupData.deleteOne({'email':emailstud})
    .then()
    EnrollstudentData.deleteOne({'_id':idstud})
    .then()
    res.send();
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'hridscp123@gmail.com',
          pass: 'Jith1234#'
        }
      });
      
      var mailOptions = {
        from: 'hridscp123@gmail.com',
        to: emailstud,
        subject: 'Enrollment mail',
        text: "Greeting from ICT Academy of Kerala, unfortunately your enrollment has been denied. For further details please contact ICT academy"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
          res.render("welcomes",{
             fname:req.query.names
          }); 
  })
  })
//send notification employee enrollment form to admin for confirmation
app.get('/notificationemployee',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
   EnrollemployeeData.find({"confstatus":"pending"})
    .then(function(notifyemployee){
        res.send(notifyemployee);
    });
});
app.get('/notificationstudent',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
   EnrollstudentData.find({"confstatus":"pending"})
    .then(function(notifystudent){
        res.send(notifystudent);
    });
});
//notification count
app.get('/pendingenroll',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    SignupData.countDocuments({confstatus:"pending"})
    .then(function(pending){
        res.status(200).send({pending});
    });
})
//student count
app.get('/studentcounts',function(req,res){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  EnrollstudentData.countDocuments({confstatus:"confirm"})
  .then(function(confstudents){
    console.log(confstudents)
      res.status(200).send({confstudents});
  });
})
//employee count
app.get('/employeecountrs',function(req,res){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  EnrollemployeeData.countDocuments({confstatus:"confirm"})
  .then(function(confemployees){
    console.log(confemployees)
      res.status(200).send({confemployees});
  });
})
//show single course
app.get('/:id',(req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
      CourseData.findById(id)
      .then((course)=>{
          res.send(course);
      });
  })
  //show single employee data
  app.get('/singlenewemployee/:id',  (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
     EnrollemployeeData.findOne({"_id":id})
      .then((employee)=>{
          res.send(employee);
      });
  })
  app.get('/singlenewstudent/:id',  (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
    console.log(id);
     EnrollstudentData.findOne({"_id":id})
      .then((student)=>{
          res.send(student);
      });
  })
  //display students for course
  app.get('/displaystudentcourse/:id',  (req, res) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    const id = req.params.id;
    CourseData.findOne({"_id":id})
    .then((course)=>{
    course=course.coursename
     EnrollstudentData.find({course:course,confstatus:'confirm'})
      .then((student)=>{
          res.send(student);
      });
    })
  })
  //confirm employee
  app.put('/confirmnewemployee',(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id,
    email=req.body.email
    confstatus=req.body.confstatus
    console.log(confstatus)
    EnrollemployeeData.findOne().sort({empid:-1})
    .then((data)=>{
      console.log(data.empid)
       
         idnew=data.empid
         if(!data.empid){
            idemp='EMP01'
        }
        else{
       var num = idnew.slice(-2)
       console.log(num)
       let id1= parseInt(num);
      
       id2=id1+1
    
       if(id2<10){
           id2= `0`+`${id2}`;
       }
     idemp=`EMP`+`${id2}`
     
  
}   
EnrollemployeeData.findByIdAndUpdate({"_id":id},
{$set:{ "confstatus": req.body.confstatus,
        "empid":idemp
   }})
.then()
employeeId=idemp
SignupData.findOneAndUpdate({"email":email},
{$set:{ "confstatus": "confirm",
     "regid": employeeId
   }})
.then(function(){
res.send();
})
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hridscp123@gmail.com',
      pass: 'Jith1234#'
    }
  });
  
  var mailOptions = {
    from: 'hridscp123@gmail.com',
    to: req.body.email,
    subject: 'Confirmation mail',
    text: "Greeting from ICT Academy of Kerala,It our pleasure to inform you that you have been successfully enrolled as an employee in our institution. Your employee ID will be " +employeeId
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
      res.render("welcomes",{
         fname:req.query.names
      });
    
  
  })
 })
 //confirm new student
 app.put('/confirmnewstudent',(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body._id,
    email=req.body.email
    course=req.body.course
    confstatus=req.body.confstatus
    console.log(confstatus)
    EnrollstudentData.findOne().sort({studid:-1})
    .then((data)=>{
      console.log(data.studid)
      
       CourseData.findOne({coursename:course})
         .then(function(coursedetails){
        studentids=coursedetails.courseId
        idnews=data.studid
        if(!data.studid){
           idemps=`${studentids}`+`01`
       }
       else{
      var num = idnews.slice(-2)
      console.log(num)
      let id1= parseInt(num);
      id2=id1+1
   console.log(id2)
      if(id2<10){
          id2= `0`+`${id2}`;
      }
    idemps=`${studentids}`+`${id2}`
} 
        EnrollstudentData.findByIdAndUpdate({"_id":id},
        {$set:{ "confstatus": req.body.confstatus,
                "studid":idemps
           }})
.then()
  
studentId=idemps
SignupData.findOneAndUpdate({"email":email},
{$set:{ "confstatus": "confirm",
       "regid": studentId
   }})
.then(function(){
res.send();
})
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hridscp123@gmail.com',
      pass: 'Jith1234#'
    }
  });
  
  var mailOptions = {
    from: 'hridscp123@gmail.com',
    to: req.body.email,
    subject: 'Confirmation mail',
    text: "Greeting from ICT Academy of Kerala,It our pleasure to inform you that you have been successfully enrolled as a student in our institution. Your student ID will be " +studentId
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
      res.render("welcomes",{
         fname:req.query.names
      });
  })
  }) 
 })
 // add new course
app.post('/insertcourse',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    var newcourse={
        courseId:req.body.course.courseId,
        course:req.body.course.course,
        coursename:req.body.course.coursename,
        details:req.body.course.details,
        image:req.body.course.image,
        imageurl:req.body.course.imageurl
    }
    var newcourse = new CourseData(newcourse);
    newcourse.save();
});
//employee enrollment form
app.post('/enrollemployee',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    var newemployee={
        fullname:req.body.enrollemp.fullname,
        email:req.body.enrollemp.email,
        phone:req.body.enrollemp.phone,
        address:req.body.enrollemp.address,
        qualification:req.body.enrollemp.qualification,
        skill:req.body.enrollemp.skill,
        empstatus:req.body.enrollemp.empstatus,
       techtrain:req.body.enrollemp.techtrain,
        year:req.body.enrollemp.year,
        empid:req.body.enrollemp.empid,
        photo:req.body.enrollemp.photo,
        photourl:req.body.enrollemp.photourl,
        confstatus:req.body.enrollemp.confstatus
    }
    email=req.body.enrollemp.email 
            EnrollemployeeData.findOne({email:email},function (err, user) {
                if(user){
                    res.status(401).send('Email already exists') 
                }
                else{
            var newemployee={
                fullname:req.body.enrollemp.fullname,
                email:req.body.enrollemp.email,
                phone:req.body.enrollemp.phone,
                address:req.body.enrollemp.address,
                qualification:req.body.enrollemp.qualification,
                skill:req.body.enrollemp.skill,
                empstatus:req.body.enrollemp.empstatus,
               techtrain:req.body.enrollemp.techtrain,
                year:req.body.enrollemp.year,
                empid:req.body.enrollemp.empid,
                photo:req.body.enrollemp.photo,
                photourl:req.body.enrollemp.photourl,
                confstatus:req.body.enrollemp.confstatus
            }
    var newemployee = new EnrollemployeeData(newemployee);
    newemployee.save();
    res.status(200).send();
        }
    });
    SignupData.findOneAndUpdate({email:email},
        {$set:{ "confstatus": "pending"
           }})
.then(function(){
res.send();
})
});
//to enroll student
app.post('/enrollstudent',verifyToken,function(req,res){
    res.header("Access-Control-Allow-Origin","*")
    res.header('Access-Control-Allow-Methods:GET,POST,PATCH,PUT,DELETE,OPTIONS');
    
    var newstudenroll={
        fullname:req.body.studenroll.fullname,
        email:req.body.studenroll.email,
        phone:req.body.studenroll.phone,
        address:req.body.studenroll.address,
        place:req.body.studenroll.photo,
        qualification:req.body.studenroll.qualification,
        passout:req.body.studenroll.passout,
        skill:req.body.studenroll.skill,
        empstatus:req.body.studenroll.empstatus,
        techtrain:req.body.studenroll.techtrain,
        year:req.body.studenroll.year,
        course:req.body.studenroll.course,
        // fee:req.body.studenroll.fee,
        studcardnumber:req.body.studenroll.studcardnumber,
        studedate:req.body.studenroll.studedate,
        studcsc:req.body.studenroll.studcsc,
        studid:req.body.studenroll.studid,
       photo:req.body.studenroll.photo,
  photourl:req.body.studenroll.photourl,
  confstatus:req.body.studenroll.confstatus
     }
     email=req.body.studenroll.email 
     EnrollstudentData.findOne({email:email},function (err, user) {
         if(user){
             res.status(401).send('Email already exists') 
         }
         else{
            var newstudenroll={
                fullname:req.body.studenroll.fullname,
                email:req.body.studenroll.email,
                phone:req.body.studenroll.phone,
                address:req.body.studenroll.address,
                place:req.body.studenroll.place,
                qualification:req.body.studenroll.qualification,
                passout:req.body.studenroll.passout,
                skill:req.body.studenroll.skill,
                empstatus:req.body.studenroll.empstatus,
                techtrain:req.body.studenroll.techtrain,
                year:req.body.studenroll.year,
                course:req.body.studenroll.course,
                // fee:req.body.studenroll.fee,
                studcardnumber:req.body.studenroll.studcardnumber,
                studedate:req.body.studenroll.studedate,
                studcsc:req.body.studenroll.studcsc,
                studid:req.body.studenroll.studid,
               photo:req.body.studenroll.photo,
          photourl:req.body.studenroll.photourl,
          confstatus:req.body.studenroll.confstatus
             }
   // console.log(studenroll);
    var newstudenroll=new EnrollstudentData(newstudenroll);
    newstudenroll.save();
    res.status(200).send();
    SignupData.findOneAndUpdate({email:email},
        {$set:{ "confstatus": "pending"
           }})
.then(function(){
res.send();
})
         }
        })
});
//get enrollstudata
app.get('/enrollstudata/:id',  (req, res) => {
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  const emailstud = req.params.id;
  console.log(emailstud)
  EnrollstudentData.findOne({"email":emailstud})
  .then((enrollstud)=>{
        res.send(enrollstud);
  })
})
//assign employee to course
app.put('/updateempcourse',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    var empcourse={
        coursename:req.body.coursename,
        employeename:req.body.employeename
    }
    employeename=req.body.employeename
    coursename=req.body.coursename
    EmployeeCourseData.findOne({employeename:employeename,coursename:coursename},function(err,user){
        if(user){
            res.status(401).send('Employee already assigned')
        }
        else{
            var empcourse={
                coursename:req.body.coursename,
                employeename:req.body.employeename
            }
            var empcourse = new EmployeeCourseData(empcourse);
            empcourse.save();
            res.status(200).send()
        }
    })
   
});

//delete complete employee data assigned to course
app.delete('/removeemployee/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
        EmployeeCourseData.findOne({'_id':id})
        .then(employeeassign)
        employeename=employeeassign.employeename
        EmployeeCourseData.deleteMany({'employeename':employeename})
        res.send();
  })

  //delete complete employee data
  app.delete('/removeemployeeenroll/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
      EnrollemployeeData.findOne({'_id':id})
      .then((employeess)=>{
        email= employeess.email
        employeename=employeess.fullname
        SignupData.deleteOne({'email':email})
        .then()
        EmployeeCourseData.deleteMany({'employeename':employeename})
        .then()
        EnrollemployeeData.deleteOne({'_id':id})
        .then()
        res.send();
      })
  })
  //remove employee
  app.delete('/removestudentenroll/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
      EnrollstudentData.findOne({'_id':id})
      .then((students)=>{
        email= students.email
        SignupData.deleteOne({'email':email})
        .then()
        EnrollstudentData.deleteOne({'_id':id})
        .then()
        res.send();
      })
  })
  //update fee status
  app.put('/updatefeedata',verifyToken,(req,res)=>{ 
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    email=req.body.email
    console.log('email is'+email)
  EnrollstudentData.findOneAndUpdate({"email":email},
                                {$set:{"studcsc":"paid",
                               }})
   .then(function(){
       res.send();
   })
 })
//update course
app.put('/updatecourse',verifyToken,(req,res)=>{ 
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id=req.body.id,
    console.log(id)
    courseId= req.body.courseId,
    course = req.body.course,
    coursename= req.body.coursename,
    details = req.body.details,
    image = req.body.image,
    imageurl = req.body.imageurl
  CourseData.findByIdAndUpdate({"_id":id},
                                {$set:{"courseId":courseId,
                                "details":details,
                                "image":image,
                                "imageurl":imageurl,
                                "course":course}})
   .then(function(){
       res.send();
   })
 })
  
 
 //delete course
 app.delete('/removecourse/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
    CourseData.findByIdAndDelete({"_id":id})
    .then(()=>{
        console.log('success')
        res.send();
    })
  })
 //remove employee from course
 app.delete('/removeempcourse/:id',verifyToken,(req,res)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    id = req.params.id;
    EmployeeCourseData.findByIdAndDelete({"_id":id})
    .then(()=>{
        console.log('success')
        res.send();
    })
  })
 
app.listen(5200);