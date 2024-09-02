const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config()
require("./DB/Connection");
const useRouter = require("./Router/userRouter")
const messagerouter = require("./Router/messagerouter")
const cookieParser = require('cookie-parser');
const {app,server} = require("./Socket/Socket")

app.use(express.json());
app.use(cookieParser());
const corsOption={  
  origin:'http://localhost:3000',
  credentials:true
};
app.use(cors(corsOption)); 
app.use("/api/v1/user",useRouter)
app.use("/api/v1/messages",messagerouter)

app.get("/", (req, res) => {
  res.send("Server Start");
});

// server start listen
server.listen(process.env.PORT, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});
