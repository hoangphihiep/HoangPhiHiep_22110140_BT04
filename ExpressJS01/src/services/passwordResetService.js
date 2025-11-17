require('dotenv').config();
const User = require('../models/user');
const PasswordReset = require('../models/passwordReset');
const { sendOtpEmail } = require('./emailService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const saltRounds = 10;

// Hàm tạo OTP ngẫu nhiên 6 chữ số
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Bước 1: Gửi OTP qua email
const requestPasswordResetService = async (email) => {
    try {
        // Kiểm tra email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: 'Email không tồn tại trong hệ thống',
            };
        }

        // Xóa OTP cũ nếu có
        await PasswordReset.deleteMany({ email });

        // Tạo OTP mới
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        // Lưu OTP vào database
        await PasswordReset.create({
            email,
            otp,
            expiresAt,
        });

        // Gửi OTP qua email
        const emailSent = await sendOtpEmail(email, otp);
        if (!emailSent) {
            return {
                EC: -1,
                EM: 'Lỗi gửi email, vui lòng thử lại',
            };
        }

        return {
            EC: 0,
            EM: 'OTP đã được gửi vào email của bạn',
        };
    } catch (error) {
        console.error('Error in requestPasswordResetService:', error);
        return {
            EC: -1,
            EM: 'Lỗi server',
        };
    }
};

// Bước 2: Xác thực OTP
const verifyOTPService = async (email, otp) => {
    try {
        const passwordReset = await PasswordReset.findOne({
            email,
            otp,
            isUsed: false,
        });

        if (!passwordReset) {
            return {
                EC: 1,
                EM: 'OTP không hợp lệ',
            };
        }

        // Kiểm tra OTP hết hạn không
        if (new Date() > passwordReset.expiresAt) {
            await PasswordReset.deleteOne({ _id: passwordReset._id });
            return {
                EC: 1,
                EM: 'OTP đã hết hạn, vui lòng yêu cầu lại',
            };
        }

        // Đánh dấu OTP đã sử dụng
        await PasswordReset.updateOne(
            { _id: passwordReset._id },
            { isUsed: true }
        );

        return {
            EC: 0,
            EM: 'OTP xác thực thành công',
        };
    } catch (error) {
        console.error('Error in verifyOTPService:', error);
        return {
            EC: -1,
            EM: 'Lỗi server',
        };
    }
};

// Bước 3: Đặt lại mật khẩu
const resetPasswordService = async (email, otp, newPassword) => {
    try {
        // Kiểm tra OTP có hợp lệ và đã được xác thực không
        const passwordReset = await PasswordReset.findOne({
            email,
            otp,
            isUsed: true,
        });

        if (!passwordReset) {
            return {
                EC: 1,
                EM: 'OTP không hợp lệ hoặc chưa được xác thực',
            };
        }

        // Tìm user
        const user = await User.findOne({ email });
        if (!user) {
            return {
                EC: 1,
                EM: 'Người dùng không tồn tại',
            };
        }

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu
        await User.updateOne({ email }, { password: hashedPassword });

        // Xóa bản ghi PasswordReset
        await PasswordReset.deleteOne({ _id: passwordReset._id });

        return {
            EC: 0,
            EM: 'Đặt lại mật khẩu thành công',
        };
    } catch (error) {
        console.error('Error in resetPasswordService:', error);
        return {
            EC: -1,
            EM: 'Lỗi server',
        };
    }
};

module.exports = {
    requestPasswordResetService,
    verifyOTPService,
    resetPasswordService,
};
