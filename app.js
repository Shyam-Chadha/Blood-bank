require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const lodash = require("lodash");7

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());

try {
  mongoose.connect(
    "mongodb://localhost:27017/Blood_bank"
  );
  console.log("MongoDB connected");
} catch (err) {
  console.log(err);
}


const userSchema = new mongoose.Schema({
  name:String,
  blood_group:String,
  pincode:String,
  phone:String,
  address:String
});

const User = new mongoose.model("User", userSchema);

  app.get("/",function(req,res){
    res.render("index");
});

app.get("/register", function (req, res) {
    res.render("register");
  });

  app.post("/register",function (req,res) {
    const newUser = new User({
        name:req.body.name,
        blood_group : req.body.blood_group,
        pincode : req.body.pincode,
        phone : req.body.phone,
        address:req.body.address
    });

    newUser.save(function (err) {
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/login");
        }
    });
});

  app.get("/login", function (req, res) {
    res.render("login");
  });

  app.post("/login",function (req,res) {
    const username = req.body.name;
    const password = req.body.phone;

    User.findOne({name:username} , function (err,found) {
        if(err){
            console.log(err);
        }
        else{
            if(found){
                if(password === found.phone){
                    res.redirect("/journey");
                }
                else{
                  res.json({ success: false, message: "Username or Password was wrong" });
                }
            }
        }
    })
});

  app.get("/elegibility",function(req,res){
    res.render("eligibility");
});

app.get("/journey",function(req,res){
  res.render("journey");
});

  app.listen("3000", function () {
    console.log("Server is running");
});