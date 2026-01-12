import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Reset Your Password - OTP",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p style="font-size: 16px; color: #555;">
                You requested to reset your password. Use the OTP below to proceed:
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; background-color: #ff4d2d; color: white;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 14px; color: #999;">
                This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #aaa;">&copy; 2025 Your Company. All rights reserved.</p>
        </div>
        `
    });
};

export const sendPaymentSuccessEmail = async (to, details) => {
    const { plan, amount, date, transactionId } = details;

    await transporter.sendMail({
        from: process.env.EMAIL, 
        to,
        subject: `✅ Payment Successful - Your ${plan} Plan is Active!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #E50914; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Payment Received</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Hello,</p>
                    <p style="font-size: 16px; color: #333;">
                        Thank you for subscribing to <strong>Premium</strong>! Your payment was successful, and your account has been upgraded instantly.
                    </p>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">🧾 Invoice Details</h3>
                        <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
                        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${amount}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
                        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> <span style="font-family: monospace;">${transactionId}</span></p>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        You can now enjoy unlimited streaming of all our movies and TV shows.
                    </p>

                    <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #E50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Watching Now</a>
                </div>
                
                <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #888;">
                    <p>Netflix Clone Inc. | Secure Payment via Stripe</p>
                </div>
            </div>
        `
    });
    console.log(`📧 Invoice sent to ${to}`);
};