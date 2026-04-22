const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let dbReady = false;
const fallbackStorage = [];

// Connect to MongoDB (local or Atlas) //abc
mongoose.connect("mongodb+srv://onelherath0918_db_user:123@cluster0.lyfk1al.mongodb.net/?appName=Cluster0").then(() => {
  dbReady = true;
  console.log("MongoDB connected successfully.");
}).catch(err => {
  console.warn("MongoDB connection failed. Running without database:", err.message);
});

const BehaviorSchema = new mongoose.Schema({
  studentId: String,
  activity: String,
  idleTime: Number,
  scrollTime: Number,
  clicks: Number,
  drags: Number,
  correctDrops: Number,
  wrongDrops: Number,
  timestamp: { type: Date, default: Date.now },
});

const Behavior = mongoose.model("Behavior", BehaviorSchema);

// API to save data
app.post("/save", async (req, res) => {
  console.log("POST /save received", { body: req.body, dbReady });
  try {
    if (dbReady) {
      const data = new Behavior(req.body);
      await data.save();
      console.log("Saved to MongoDB", req.body);
      return res.send("Saved!");
    }

    fallbackStorage.push({ ...req.body, timestamp: new Date() });
    console.log("Saved locally because MongoDB is unavailable:", req.body);
    return res.send("Saved locally");
  } catch (err) {
    console.error("Save failed:", err.message, err.stack);
    fallbackStorage.push({ ...req.body, timestamp: new Date(), error: err.message });
    return res.status(200).send("Saved locally");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});