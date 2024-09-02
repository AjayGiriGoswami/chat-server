const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO)
  .then(() => console.log("Connection Start..............."))
  .catch((error) => console.log(error));
