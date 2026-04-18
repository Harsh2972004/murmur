import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (
  username: string,
  email: string,
  resetCode: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await transporter.sendMail({
      from: `"Murmur" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Murmur | Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hey @${username}, reset your password</h2>
          <p>Use the code below to reset your Murmur password:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
            ${resetCode}
          </div>
          <p>This code expires in 1 hour.</p>
          <p>If you didn't request a password reset, ignore this email.</p>
        </div>
      `,
    });

    return { success: true, message: "Reset password email sent successfully" };
  } catch (error) {
    console.error("Error sending reset password email", error);
    return { success: false, message: "Failed to send reset password email" };
  }
};
