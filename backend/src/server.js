const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const attackRoutes = require("./routes/attackRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/ids_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.use("/api/attack", attackRoutes);
app.use("/api/auth", require("./routes/authRoutes"));

app.use(express.static(path.join(__dirname, "../../client")));
app.use("/dashboard", express.static(path.join(__dirname, "../../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/login.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
