const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@crockery.com";
    const password = "Admin@123456";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: "Crockery Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log(`Admin ID: ${admin._id}`);
    console.log(`Admin Email: ${admin.email}`);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:");
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();
