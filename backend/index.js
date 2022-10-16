const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const pinRoute = require("./routes/pins");
const usersRoute = require("./routes/users");
const cors = require("cors");


dotenv.config();

// 可以使用json
app.use(express.json());
app.use(cors());
app.use("/api/pins", pinRoute)
app.use("/api/users", usersRoute)

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected")
  })
  .catch((err) => console.log(err))

app.listen(8800, () => {
  console.log("Backend server is running!")
})