import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";

export const POST = async (request: Request) => {
  await dbConnect();

  try {
    const { username, code, newPassword, confirmPassword } =
      await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const isCodeValid = user.resetCode === code;
    const isCodeNotExpired = new Date(user.resetCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      if (newPassword === confirmPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetCode = "";
        user.resetCodeExpiry = new Date();
        await user.save();

        return Response.json(
          {
            success: true,
            message: "Password reset was successful",
          },
          { status: 200 },
        );
      }

      return Response.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Code is expired",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Code is invalid",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error resetting password", error);
    return Response.json(
      {
        success: false,
        message: "Error resetting password",
      },
      {
        status: 500,
      },
    );
  }
};
