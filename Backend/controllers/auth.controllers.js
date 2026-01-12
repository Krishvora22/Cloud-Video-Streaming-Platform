import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js"; // ✅ Correct Prisma Import
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

// 1. Sign Up (with 3-Day Free Trial)
export const signUp = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.toLowerCase();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // 🆕 CALCULATE TRIAL END DATE (Now + 3 Days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        role: role || "USER",
        plan: "free",
        trialEndsAt: threeDaysFromNow, // ✅ Enable Free Trial
      },
    });

    const token = await genToken(newUser.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = newUser;

    return res.status(201).json({
      message: "User created successfully",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    res.status(500).json({
      message: "Error while creating user",
      error: error.message,
    });
  }
};

// 2. Sign In
export const signIn = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.toLowerCase();
    
    // Use prisma.user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = await genToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user;

    return res.status(200).json({
      message: "User signed in successfully",
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sign In error",
      error: error.message,
    });
  }
};

// 3. Sign Out
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Sign Out error",
      error: error.message,
    });
  }
};

// 4. Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity

    const hashedOtp = await bcrypt.hash(otp, 10);
    
    // Update using Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: hashedOtp,
        otpExpiresAt: otpExpires,
      },
    });

    await sendOtpMail(email, otp);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({
      message: "Send OTP error",
      error: error.message,
    });
  }
};

// 5. Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No OTP found. Please request again." });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, user.otpCode);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update using Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Verify OTP error",
      error: error.message,
    });
  }
};

// 6. Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({ message: "New password must be different" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    
    // Update using Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword,
        isVerified: false,
      },
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Reset Password error",
      error: error.message,
    });
  }
};