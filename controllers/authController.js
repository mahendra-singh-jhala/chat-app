// Import require module
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

// Load enviornment variables
require("dotenv").config();


// Controller function for user registration
exports.register = async (req, res) => {

    // destructure name, email, password from req.body
    const { username, firstname, lastname, password, gender } = req.body

    if (!password || password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long"
        });
    }

    try {
        // Check if the user name already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        // hash password
        const hashPassword = await bcrypt.hash(password, 10);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

        // register user
        const newUser = new User({
            username,
            firstname,
            lastname,
            password: hashPassword,
            gender,
            profilePicture: gender === "male" ? boyProfilePic : girlProfilePic
        })

        await newUser.save();
        res.status(200).json({
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "User registered failed",
            error: error.message
        })
    }

}


// Controller function for user login
exports.login = async (req, res) => {
    const { username, password } = req.body

    try {
        // match user email and password
        const user = await User.findOne({ username })

        if (!user) {
            res.status(400).json({
                message: "Username Not found"
            })
        }

        const matchPassword = await bcrypt.compare(password, user.password)

        if (!matchPassword) {
            return res.status(400).json({
                message: "Password Not Match"
            })
        }

        // if valid, generate the JWT token for the user
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "7D" })

        // return the token user
        res.json({
            message: "Login Successfully",
            user: {
                userId: user._id,
                username,
                firstname: user.firstname,
                lastname: user.lastname,
                profilePicture: user.profilePicture
            },
            token
        })

    } catch (error) {
        res.status(500).json({
            message: "Login Failed",
            error: error.message
        })
    }
}
