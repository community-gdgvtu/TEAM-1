import express from "express";
import {
    hashPassword,
    comparePassword,
    generateToken
} from "./auth.js";

const router = express.Router();

export default function createUserApi(db) {
    const users = db.collection("users");

    // Create unique indexes
    users.createIndex(
        { email: 1 },
        { unique: true }
    ).catch(err => {
        console.error(
            "Failed to create unique index on email:",
            err.message
        );
    });

    users.createIndex(
        { username: 1 },
        { unique: true }
    ).catch(err => {
        console.error(
            "Failed to create unique index on username:",
            err.message
        );
    });


    /* =========================================
       GET ALL USERS
       Used by inbox to show people available
       for messaging.
       ========================================= */

    router.get("/", async (req, res) => {
        try {
            const result = await users
                .find(
                    {},
                    {
                        projection: {
                            password: 0,
                            email: 0
                        }
                    }
                )
                .toArray();

            const safeUsers = result.map(user => ({
                id: user._id.toString(),
                username:
                    user.username ||
                    user.name ||
                    "Unknown User"
            }));

            res.json(safeUsers);

        } catch (error) {
            res.status(500).json({
                message: "Failed to retrieve users",
                error: error.message
            });
        }
    });


    /* =========================================
       USER REGISTRATION
       ========================================= */

    router.post("/register", async (req, res) => {
        try {
            const {
                username,
                email,
                password
            } = req.body;

            if (
                !username ||
                typeof username !== "string" ||
                username.trim().length < 3
            ) {
                return res.status(400).json({
                    message:
                        "Username must be a string of at least 3 characters"
                });
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !email ||
                typeof email !== "string" ||
                !emailRegex.test(email)
            ) {
                return res.status(400).json({
                    message:
                        "A valid email address is required"
                });
            }

            if (
                !password ||
                typeof password !== "string" ||
                password.length < 6
            ) {
                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters long"
                });
            }

            const existingUser =
                await users.findOne({
                    $or: [
                        {
                            email:
                                email.toLowerCase()
                        },
                        {
                            username:
                                username.toLowerCase()
                        }
                    ]
                });

            if (existingUser) {
                if (
                    existingUser.email ===
                    email.toLowerCase()
                ) {
                    return res.status(409).json({
                        message:
                            "Email is already registered"
                    });
                }

                if (
                    existingUser.username ===
                    username.toLowerCase()
                ) {
                    return res.status(409).json({
                        message:
                            "Username is already taken"
                    });
                }
            }

            const hashedPassword =
                await hashPassword(password);

            const result =
                await users.insertOne({
                    username:
                        username.toLowerCase(),

                    email:
                        email.toLowerCase(),

                    password:
                        hashedPassword,

                    createdAt:
                        new Date()
                });

            const token =
                generateToken(
                    result.insertedId.toString()
                );

            res.status(201).json({
                message:
                    "User registered successfully",

                user: {
                    id:
                        result.insertedId,

                    username:
                        username.toLowerCase(),

                    email:
                        email.toLowerCase()
                },

                token
            });

        } catch (error) {
            res.status(500).json({
                message:
                    "Registration failed",

                error:
                    error.message
            });
        }
    });


    /* =========================================
       USER LOGIN
       ========================================= */

    router.post("/login", async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            if (
                !email ||
                !password
            ) {
                return res.status(400).json({
                    message:
                        "Email and password are required"
                });
            }

            const user =
                await users.findOne({
                    email:
                        email.toLowerCase()
                });

            if (!user) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }

            const isMatch =
                await comparePassword(
                    password,
                    user.password
                );

            if (!isMatch) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }

            const token =
                generateToken(
                    user._id.toString()
                );

            res.json({
                message:
                    "Login successful",

                user: {
                    id:
                        user._id,

                    username:
                        user.username,

                    email:
                        user.email
                },

                token
            });

        } catch (error) {
            res.status(500).json({
                message:
                    "Login failed",

                error:
                    error.message
            });
        }
    });


    /* =========================================
       OLD USER POST
       Kept for backwards compatibility
       ========================================= */

    router.post("/", async (req, res) => {
        try {
            const result =
                await users.insertOne({
                    name:
                        req.body.name
                });

            res.status(201).json({
                message:
                    "User added",

                id:
                    result.insertedId
            });

        } catch (error) {
            res.status(500).json({
                message:
                    "Failed to add user",

                error:
                    error.message
            });
        }
    });


    return router;
}