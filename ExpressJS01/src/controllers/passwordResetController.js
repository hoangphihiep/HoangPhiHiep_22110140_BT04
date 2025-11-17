const {
    requestPasswordResetService,
    verifyOTPService,
    resetPasswordService,
} = require('../services/passwordResetService');

// POST: Yêu cầu gửi OTP
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            EC: 1,
            EM: 'Email không được để trống',
        });
    }

    const data = await requestPasswordResetService(email);
    return res.status(200).json(data);
};

// POST: Xác thực OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            EC: 1,
            EM: 'Email và OTP không được để trống',
        });
    }

    const data = await verifyOTPService(email, otp);
    return res.status(200).json(data);
};

// POST: Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
        return res.status(400).json({
            EC: 1,
            EM: 'Vui lòng điền đầy đủ thông tin',
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            EC: 1,
            EM: 'Mật khẩu xác nhận không khớp',
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            EC: 1,
            EM: 'Mật khẩu phải có ít nhất 6 ký tự',
        });
    }

    const data = await resetPasswordService(email, otp, newPassword);
    return res.status(200).json(data);
};

module.exports = {
    requestPasswordReset,
    verifyOTP,
    resetPassword,
};
