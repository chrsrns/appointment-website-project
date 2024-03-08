const cors = require("cors");
const express = require("express");
const app = express();
const fakedata = require("./prisma/fake-data");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// For logging
require("console-stamp")(console);
const elapsed = require("elapsed-time-logger");

elapsed.start("init");

require("dotenv").config();

console.log("Configuring Express and CORS...");
elapsed.start("cors");
app.use(express.json());
app.use(cors());
elapsed.end("cors", "Express and CORS configured in");

// For testing, add intentional delay
// app.use(function(req, res, next) { setTimeout(next, 500) });

// Frontend Static
console.log("Adding routes to Express...");
elapsed.start("static");
const path = __dirname + "/src-frontend-react/build/";
app.use(express.static(path));
elapsed.end("static", "Static files added in");

elapsed.start("routes");
const auth = require("./routes/auth.routes.js");
app.use("/backend/auth", auth);

const admin = require("./routes/admin.routes.js");
app.use("/backend/admin", admin);

const users = require("./routes/users.routes.js");
app.use("/backend/users", users);

const appointments = require("./routes/appointments.routes.js");
app.use("/backend/appointments", appointments);

const notifications = require("./routes/notifications.routes");
app.use("/backend/notifications", notifications);

const medrecords = require("./routes/medrecords.routes");
app.use("/backend/medrecords", medrecords);

const guidancerecords = require("./routes/guidancerecords.routes");
app.use("/backend/guidancerecords", guidancerecords);

const feedback = require("./routes/feedback.routes");
app.use("/backend/feedback", feedback);

app.post("/backend/fakestudentuser", async (req, res) => {
  try {
    const name = await prisma.user.create({
      data: fakedata.fakeStudentUser(),
    });
    res.json(name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred!" });
  }
});

app.post("/backend/fakestaffuser", async (req, res) => {
  try {
    const name = await prisma.user.create({
      data: fakedata.fakeStaffUser(),
    });
    res.json(name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred!" });
  }
});
elapsed.end("routes", "Routed added in");

console.log("Adding error handling middleware...");
elapsed.start("errmiddleware");
// Define error handling middleware
app.use((err, req, res, next) => {
  // Handle the error here, for example, send an error response to the client
  console.error(err);
  if (res.statusCode !== 200) {
    res.status(500);
  }
  res.json({ error: "Something went wrong" });
});
elapsed.end("errmiddleware", "Error middleware added in");

console.log("Adding catch-all route...");
elapsed.start("catchall");
// Define a catch-all route at the end of your routes
app.all("*", (req, res) => {
  res.redirect("/");
});
elapsed.end("catchall", "Catch-all middleware added in");

elapsed.end("init", "Server started in");

// function print(path, layer) {
//   if (layer.route) {
//     layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
//   } else if (layer.name === 'router' && layer.handle.stack) {
//     layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
//   } else if (layer.method) {
//     console.log('%s /%s',
//       layer.method.toUpperCase(),
//       path.concat(split(layer.regexp)).filter(Boolean).join('/'))
//   }
// }

// function split(thing) {
//   if (typeof thing === 'string') {
//     return thing.split('/')
//   } else if (thing.fast_slash) {
//     return ''
//   } else {
//     var match = thing.toString()
//       .replace('\\/?', '')
//       .replace('(?=\\/|$)', '$')
//       .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
//     return match
//       ? match[1].replace(/\\(.)/g, '$1').split('/')
//       : '<complex:' + thing.toString() + '>'
//   }
// }

// app._router.stack.forEach(print.bind(null, []))

module.exports = app;
