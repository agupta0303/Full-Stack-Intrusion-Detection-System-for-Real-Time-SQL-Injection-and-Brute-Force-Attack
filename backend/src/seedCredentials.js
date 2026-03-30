const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Credentials = require("./models/credentials");

mongoose.connect("mongodb://127.0.0.1:27017/ids_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const TOTAL_USERS = 500;

function generateUsername(i) {
  const names = ["john", "alice", "bob", "charlie", "david", "eva", "mike", "sara"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  return `${randomName}${i}`;
}

function generatePassword() {
  const base = ["pass", "user", "admin", "test"];
  const random = base[Math.floor(Math.random() * base.length)];
  return `${random}@${Math.floor(100 + Math.random() * 900)}`;
}

async function seed() {
  try {
    console.log("Connecting to DB...");

    await mongoose.connection;

    console.log("Clearing old data...");
    await Credentials.deleteMany();

    const users = [];

    console.log("Generating users...");

    for (let i = 1; i <= TOTAL_USERS; i++) {
      const username = generateUsername(i);
      const password = generatePassword();

      const hashedPassword = await bcrypt.hash(password, 10);

      users.push({
        username,
        password: hashedPassword
      });
    }

    console.log("Inserting into DB...");
    const result = await Credentials.insertMany(users);

    console.log(`${result.length} users inserted successfully`);

    process.exit();
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

seed();