const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const { requestPasswordReset, verifyOTP, resetPassword } = require('../controllers/passwordResetController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// apply auth middleware to all routes on this router
routerAPI.use(auth);

routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
});

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);

routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

// Password Reset Routes
routerAPI.post("/forgot-password", requestPasswordReset);
routerAPI.post("/verify-otp", verifyOTP);
routerAPI.post("/reset-password", resetPassword);

module.exports = routerAPI; //export default