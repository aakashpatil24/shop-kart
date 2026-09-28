import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

// One entry per active refresh token, so a user can be logged in on multiple
// devices and each session can be revoked individually.
interface RefreshTokenEntry {
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  refreshTokens: RefreshTokenEntry[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const refreshTokenSchema = new Schema<RefreshTokenEntry>(
  {
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // never returned unless a query opts in with .select('+password')
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// mongoose 9's pre('save') hooks are promise-based, no `next` callback.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const SALT_ROUNDS = 12;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Strips password/refreshTokens even if a query ever selects them by accident.
// Destructuring (not `delete`) because mongoose's ret type marks these fields as non-optional.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { password: _password, refreshTokens: _refreshTokens, ...rest } = ret;
    return rest;
  },
});

export const User: Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema);
