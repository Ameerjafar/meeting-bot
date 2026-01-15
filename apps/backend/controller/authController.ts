import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import { SignInValidation, SignUpValidation } from "@schemas";
import jwt from 'jsonwebtoken';
export const signUpController = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "invalid request" });
    }
    const validation = SignUpValidation.safeParse({
      fullName,
      email,
      password,
    });
    if (!validation.success) {
      return res
        .status(403)
        .json({ success: false, message: "You are not met our constraints" });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "This email was already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_VALUE!));
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });
    return res
      .status(201)
      .json({ success: true, message: "User Created successfully", user });
  } catch (error: unknown) {
    console.log(error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const signInController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "invalid request" });
    }
    const validation = SignInValidation.safeParse({ email, password });
    if (!validation.success) {
      return res.status(403).json({ message: "You are met our constraints" });
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "we cannot found the email on db" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "password is wrong" });
    }
    const token = jwt.sign({userId: existingUser.id}, process.env.JWT_SECRET!);
    return res.status(200).json({
      success: true,
      message: "logged in successfully",
      token,
    });
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
