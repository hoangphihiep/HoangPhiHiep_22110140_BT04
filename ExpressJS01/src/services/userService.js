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
        // Kiểm tra user đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`❌ Email đã tồn tại: ${email}`);
            return {
                EC: 1,
                EM: "Email đã tồn tại trong hệ thống"
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Tạo user mới
        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: "User",
        });
        
        console.log(`✅ Tạo user thành công: ${email}`);
        
        return {
            EC: 0,
            EM: "Tạo tài khoản thành công",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        };
    } catch (error) {
        console.error('❌ Error in createUserService:', error);
        return {
            EC: -1,
            EM: "Lỗi hệ thống. Vui lòng thử lại sau"
        };
    }
};

const loginService = async (email, password) => {
    try {
        // Tìm user theo email
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return {
                EC: 1,
                EM: "Email hoặc mật khẩu không đúng"
            };
        }

        // So sánh password
        const isMatchPassword = await bcrypt.compare(password, user.password);
        
        if (!isMatchPassword) {
            return {
                EC: 2,
                EM: "Email hoặc mật khẩu không đúng"
            };
        }

        // ✅ Tạo JWT với đầy đủ thông tin bao gồm ROLE
        const payload = {
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role // ⚠️ QUAN TRỌNG: Thêm role vào token
        };

        const access_token = jwt.sign(payload, jwtSecret, { 
            expiresIn: jwtExpire 
        });

        console.log(`✅ User ${email} đăng nhập thành công - Role: ${user.role}`);

        return {
            EC: 0,
            EM: "Đăng nhập thành công",
            access_token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    } catch (error) {
        console.error('❌ Error in loginService:', error);
        return {
            EC: -1,
            EM: "Lỗi hệ thống. Vui lòng thử lại sau"
        };
    }
};

const getUserService = async () => {
    try {
        // Lấy tất cả user, loại bỏ password
        const users = await User.find({}).select("-password");
        
        return {
            EC: 0,
            EM: "Lấy danh sách user thành công",
            data: users
        };
    } catch (error) {
        console.error('❌ Error in getUserService:', error);
        return {
            EC: -1,
            EM: "Lỗi hệ thống. Vui lòng thử lại sau"
        };
    }
};


module.exports = {
    createUserService, 
    loginService, 
    getUserService
};