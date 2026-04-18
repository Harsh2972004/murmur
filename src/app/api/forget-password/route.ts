import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { sendPasswordResetEmail } from "@/helpers/sendResetPasswordEmail";

export const POST = async (request: Request) => {
  await dbConnect();

  try {
    const { email } = await request.json();
    const user = await UserModel.findOne({
      email,
      isVerified: true,
    });
    if (!user) {
      return Response.json({
        success: false,
        message: "If this account exist, You will receive a rest code.",
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    user.resetCode = resetCode;
    user.resetCodeExpiry = expiryDate;
    await user.save();

    const emailResponse = await sendPasswordResetEmail(
      user.username,
      email,
      resetCode,
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        },
      );
    }

    return Response.json(
      {
        success: true,
        message: "If this account exist, You will receive a rest code.",
        username: user.username,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending reset code", error);
    return Response.json(
      {
        success: false,
        message: "Error sending reset code",
      },
      {
        status: 500,
      },
    );
  }
};
