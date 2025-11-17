require('dotenv').config();
const nodemailer = require('nodemailer');

// Cấu hình transporter cho Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Hàm gửi email xác thực OTP
const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP xác thực đặt lại mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #333;">Xác thực đặt lại mật khẩu</h2>
                        <p style="color: #666; font-size: 16px;">
                            Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP dưới đây để xác thực:
                        </p>
                        <div style="background-color: #007bff; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                            <h1 style="margin: 0; letter-spacing: 5px;">${otp}</h1>
                        </div>
                        <p style="color: #999; font-size: 14px;">
                            Mã OTP này có hiệu lực trong 10 phút. Nếu bạn không yêu cầu này, vui lòng bỏ qua email.
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✓ OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = {
    sendOtpEmail,
};
