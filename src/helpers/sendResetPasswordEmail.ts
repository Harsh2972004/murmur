import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import PasswordResetEmail from "../../emails/PasswordResetEmail";

export const sendPasswordResetEmail = async (
  username: string,
  email: string,
  resetCode: string,
): Promise<ApiResponse> => {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: "Murmur | Password Reset Code",
      react: PasswordResetEmail({ username, resetCode }),
    });
    return { success: true, message: "Reset email sent successfully" };
  } catch (error) {
    return { success: false, message: "Failed to send reset email" };
  }
};
