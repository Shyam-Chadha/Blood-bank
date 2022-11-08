require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator')
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const lodash = require("lodash");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

try {
  mongoose.connect(
    "mongodb://localhost:27017/Blood_bank"
  );
  console.log("MongoDB connected");
} catch (err) {
  console.log(err);
}

const userSchema = new mongoose.Schema({
  username:String,
  blood_group:String,
  password:String,
  phone:String,
  flatno:String,
  addline1:String,
  state:String,
  pincode:String,
});

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  disease:String,
  otherdisease:String,
  tatoo:Boolean,
  age:String,
  drinking:String,
  smoking:String,
  donatedbefore:String,
  vaccinated:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);

const User = new mongoose.model("User", userSchema);

const Donor = new mongoose.model("Donor", donorSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("index");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const { username, blood_group, pincode, phone, password, address } = req.body;
  User.register({ username: username,blood_group:blood_group,pincode:pincode,phone:phone,address:address  }, password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/error");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/login");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  const { username, password } = req.body;
  const user = new User({
    username: username,
    password: password,
  });

  req.login(user, (err) => {
    if (err) {
        // res.json({ success: false, message: "Username or Password was wrong" });
      console.log(err);
      res.redirect("/");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/journey");
      });
    }
  });
});

app.get("/eligibility",function(req,res){
  // if (req.isAuthenticated()) {
    res.render("eligibility" , {title:req.user.username});
  // }
});

app.post("/eligibility", function (req, res) {
  const Donor = new donorModel({
    user: req.user._id,
    disease: req.body.DISEASES,
    otherdisease:req.bodyOTHER_DISEASE.toUpperCase(),
    tatoo: req.body.TATOO,
    age: req.body.AGE_GROUP,
    drinking: req.body.DRINKING,
    smoking: req.body.SMOKING,
    donatedbefore: req.body.DONATED_BEFORE,
    vaccinated: req.body.VACCINATED
  });

  Donor.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.get("/journey", function (req, res) {
    if (req.isAuthenticated()) {
      res.render("journey" , {title:req.user.username});
    } else {
      res.redirect("/login");
    }
  });


app.get("/addressbook" , function(req,res){
  res.render("Addressbook");
});

app.get("/error",function (req,res) {
  res.sendFile(path.join(__dirname + '/public/error.html'));
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Successfully started the server");
});
