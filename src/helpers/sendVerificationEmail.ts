import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verifyCode: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    await transporter.sendMail({
      from: `"Murmur" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Murmur | Verify your account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hey @${username}, verify your account</h2>
          <p>Use the code below to verify your Murmur account:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
            ${verifyCode}
          </div>
          <p>This code expires in 1 hour.</p>
          <p>If you didn't sign up for Murmur, ignore this email.</p>
        </div>
      `,
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { success: false, message: "Failed to send verification email" };
  }
};
