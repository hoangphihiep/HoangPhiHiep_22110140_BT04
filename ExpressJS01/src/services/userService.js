require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
// Fallbacks for development if env vars are missing
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_this';
const jwtExpire = process.env.JWT_EXPIRE || '7d';

if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRE) {
    console.warn('Warning: JWT_SECRET or JWT_EXPIRE not set in .env — using development defaults');
}

const createUserService = async (name, email, password) => {
    try {
        //check user exist
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        //hash user password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        //save user to database
        let result = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: "User",
        });
        return result;
    } catch (error) {
           console.error(error);
           return {
              EC: -1,
              EM: "Internal server error"
           };
    }
};

const loginService = async (email, password) => {
    try {
        //fetch user by email
        const user = await User.findOne({ email: email });
        if (user) {
            //compare password
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hợp lệ"
                };
            } else { //create an access token
                const payload = {
                    email: user.email,
                    name: user.name,
                }

                const access_token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });

                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                };
            }
        }else{
            return{
                EC: 1,
                EM: "Email/Password không hợp lệ"
            }
        }
    } catch (error) {
           console.error(error);
           return {
              EC: -1,
              EM: "Internal server error"
           };
    }
};

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) {
           console.error(error);
           return {
              EC: -1,
              EM: "Internal server error"
           };
    }
};

module.exports = {
    createUserService, 
    loginService, 
    getUserService
};