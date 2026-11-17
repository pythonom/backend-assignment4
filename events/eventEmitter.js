const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

eventEmitter.on("userRegistered", (user) => {
  console.log("New User Registered:", user.email);
});

module.exports = eventEmitter;
