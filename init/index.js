const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main().then((res)=>{
    console.log("database connect");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/room');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const initDB = async () => {
  try {
    await Listing.deleteMany({}); // Clears existing data
    await Listing.insertMany(initData.data); // Inserts new data from data.js
    console.log("Data was initialized successfully");
  } catch (err) {
    console.log("Error initializing data:", err);
  }
};
initDB();