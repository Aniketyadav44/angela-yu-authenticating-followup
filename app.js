require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//setting up the mongoose database for users
mongoose.connect("mongodb://localhost:27017/userDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

//home page route
app.get("/", (req, res) => {
  res.render("home");
});

//login page route
app.get("/login", (req, res) => {
  res.render("login");
});

//register page route
app.get("/register", (req, res) => {
  res.render("register");
});

//post route after creating a user by entering email and password
//it creates new document entry inside users collection in our DB
app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });
    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

//post route after logging in by entering email and password
//first checking if the user with that email exists or not by using findOne()
//and if exists, then checking if the entered password is correct or not
app.post("/login", (req, res) => {
  const pass = req.body.password;
  User.findOne({ email: req.body.username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(pass, foundUser.password, (err, result) => {
          if (result) {
            res.render("secrets");
          } else {
            res.send("Invalid Password!");
          }
        });
      } else {
        res.send("User not found!");
      }
    }
  });
});

//Serving our website on localhost:3000
app.listen(3000, () => {
  console.log("Server started at port 3000");
});
