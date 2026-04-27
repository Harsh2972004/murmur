import mongoose, { Schema, Document, Types } from "mongoose";
export interface UserType extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  resetCode?: string;
  resetCodeExpiry?: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  avatar?: string;
  bio?: string;
  friends?: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
}

const UserSchema: Schema<UserType> = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      match: [
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        "Please use a valid email.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verifyCode: {
      type: String,
      required: [true, "Verify Code is required"],
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify Code expiry is required"],
    },
    resetCode: {
      type: String,
    },
    resetCodeExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    blockedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

UserSchema.index({ username: 1, email: 1 });

const UserModel =
  (mongoose.models.User as mongoose.Model<UserType>) ||
  mongoose.model<UserType>("User", UserSchema);

export default UserModel;
