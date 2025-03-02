import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/user.js"; // Ensure this path is correct

dotenv.config();
const router = express.Router();

// Function to validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(String(email).toLowerCase());
  };
  
// User Registration Route
router.post("/register", async (req, res) => {
    try {
        // console.log("Register route called"); // Debugging

        console.log("Register request received:", req.body);
    
        const { firstName, lastName, username, email, password } = req.body;
    
        if (!firstName || !lastName || !username || !email || !password) {
          return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    const existingEmail = await User.findOne({ where: { email } });

    if (existingUser) {
        return res.status(409).json({ message: "Username already taken" }); // 409 Conflict
      }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await User.create({ firstName, lastName, username, email, password: hashedPassword });

    console.log("User created:", newUser); // Debugging
    res.status(201).json({ message: "User registered successfully!", userId: newUser.id });

  } catch (error) {
    console.error("Registration Error:", error); // Log the error for debugging
    res.status(500).json({ error: "User registration failed.", details: error.message });
  }
});

// User Login Route
router.post("/login", async (req, res) => {
    // console.log("Login request received:", req.body); //Log request data
   const { email, password } = req.body;
//    if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }


  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        // console.log("User not found for email:", email); // Log if user is missing
      return res.status(401).json({ message: "Invalid email." });
    }

    // console.log("User found:", user); //Log user data

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        // console.log("Password mismatch for:", email); //Log password mismatch
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email},
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token valid for 1h
    );

    // console.log("Login successful for user:", user.username);
    // res.json({message: "Login successful", token });

    // Return the token and user details
    res.json({
        message: "Login successful",
        token,
        user: {
          username: user.username,
          email: user.email,
        },
      });

  } catch (error) {
    console.error("Login Error:", error);  // <--- Logs the actual error in backend
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
});

export default router;
