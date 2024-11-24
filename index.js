const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const User = require("./models/User");
const Appointment = require("./models/Appointment");

const app = express();

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect(
"mongodb+srv://chandrakanth04m:P9oUbJSaqsVGkgKU@healthbridge.ewsad.mongodb.net/?retryWrites=true&w=majority&appName=HealthBridge", 
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/signup", function (req, res) {
  const errorMessage = "";
  const showErrorMessage = false;
  res.render("signup", { errorMessage, showErrorMessage });
});

app.post("/signup", async function (req, res) {
  const {
    email,
    fullName,
    password,
    confirmPassword,
    userType,
    specialization,
  } = req.body;
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%^&*])[A-Za-z\d@#$!%^&*]{8,}$/;

  if (!password.match(passwordPattern)) {
    const errorMessage = "Password does not meet the strength requirements";
    const showErrorMessage = true;
    return res.render("signup", { errorMessage, showErrorMessage });
  }

  if (password !== confirmPassword) {
    const errorMessage = "Passwords do not match";
    const showErrorMessage = true;
    return res.render("signup", { errorMessage, showErrorMessage });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const errorMessage = "User with Username already Exists";
      const showErrorMessage = true;
      return res.render("signup", { errorMessage, showErrorMessage });
    }

    var newUser;
    if (userType == "doctor") {
      newUser = new User({
        email,
        fullName,
        password,
        userType,
        specialization,
      });
    } else {
      newUser = new User({
        email,
        fullName,
        password,
        userType,
        specialization: "",
      });
    }

    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", function (req, res) {
  const errorMessage = "";
  const showErrorMessage = false;
  res.render("login", { errorMessage, showErrorMessage });
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      const errorMessage = "Invalid username or password";
      const showErrorMessage = true;
      return res.render("login", { errorMessage, showErrorMessage });
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      const errorMessage = "Invalid username or password";
      const showErrorMessage = true;
      return res.render("login", { errorMessage, showErrorMessage });
    }
    req.session.user = user;
    console.log(user.userType);
    if (user.userType === "patient") {
      req.session.isDoctor = true;
      return res.redirect("/patient-dashboard");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/patient-dashboard", function (req, res) {
  if ((req.session.isPatient = true)) {
    const user = req.session.user;
    const showMessage = false;
    const message = "";
    res.render("patientDashboard", { user, showMessage, message });
  }
});

app.get("/patient-appointments", async function (req, res) {
  if (req.session.isPatient) {
    const user = req.session.user;
    const appointments = await Appointment.find({ patient: req.query.userId });
    const doctorIds = appointments.map((appointment) => appointment.doctor);
    const doctors = await User.find({ _id: { $in: doctorIds } });
    const doctorMap = doctors.reduce((map, doctor) => {
      map[doctor._id] = doctor;
      return map;
    }, {});

    const formattedAppointments = appointments.map(appointment => ({
      doctorName: doctorMap[appointment.doctor].fullName,
      doctorSpecialization: doctorMap[appointment.doctor].specialization,
      date: appointment.date,
    }));

    const upcomingAppointments = formattedAppointments.filter(appointment => new Date(appointment.date) >= new Date());
    const pastAppointments = formattedAppointments.filter(appointment => new Date(appointment.date) < new Date());

    res.render("patientAppointments", { 
      user,
      upcomingAppointments,
      pastAppointments
    });
  }
});


app.get("/patient-doctors", async function (req, res) {
  if (req.session.isPatient) {
    const user = req.session.user;
    const doctors = await User.find({ userType: "doctor" });
    res.render("patientDoctors", { doctors, user });
  }
});

app.get("/patient-bookappointments", async function (req, res) {
  if (req.session.isPatient) {
    const { doctorId, userId, appointmentDate } = req.query;
    
    const appointment = new Appointment({
      patient: userId,
      doctor: doctorId,
      date: new Date(appointmentDate),
    });

    await appointment.save();
    const user = req.session.user;
    const showMessage = true;
    const message = "Appointment booked successfully for " + appointmentDate;
    res.render("patientDashboard", { user, showMessage, message });
  }
});

app.get("/logout", function (req, res) {
  if (req.session.isAdmin) req.session.isAdmin = false;
  else req.session.isUser = false;
  return res.redirect("/");
});
const port = process.env.PORT;
app.listen(port, function () {
  console.log("server started working on port :", port);
  require('https').get('https://ifconfig.me', res => res.on('data', d => console.log(d.toString())));
});
module.exports = app;
