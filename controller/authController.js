import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/user.js"; 

export const registerUser = async (req, res) => {
    try {
      console.log("Register request received:", req.body); // Debugging
      const { firstName, lastName, username, email, password } = req.body;
  
      if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
       return res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
  };
  