import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    console.log("inside the register");
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // Hash password
        const hashedPass = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPass });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        console.error("Registration error: ", err);
        res.status(400).json({ error: "Registration failed!", details: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
        //local storage
        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });

    } catch (err) {
        console.error("Login error: ", err);
        res.status(500).json({ error: "Login failed!", details: err.message });
    }
};
