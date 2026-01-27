import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { LoginInput, RegisterInput } from "./auth.schema";

export const registerUser = async ({ email, password, name }: RegisterInput) => {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        throw new AppError({
            status: 409,
            code: "CONFLICT",
            message: "Email already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

    const createdUser = await prisma.user.create({
        data: { email, password: hashedPassword, name },
        select: { id: true, email: true, name: true, createdAt: true },
    });

    return createdUser;
};

export const loginUser = async ({ email, password }: LoginInput) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
        });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        throw new AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
        });
    }

    const accessToken = jwt.sign(
        { userId: user.id, email: user.email, type: "access" },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, type: "refresh" },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    const publicUser = { id: user.id, email: user.email, name: user.name };

    return { accessToken, refreshToken, user: publicUser };
};

export const refreshAccessToken = async (refreshToken: string) => {
    try {
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
            userId: string;
            type: "refresh";
            iat: number;
            exp: number;
        };

        if (payload.type !== "refresh") {
            throw new AppError({
                status: 401,
                code: "UNAUTHORIZED",
                message: "Invalid token type",
            });
        }
    
        // اختياري (لكن كويس): تأكد إن المستخدم لسه موجود
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            throw new AppError({
                status: 401,
                code: "UNAUTHORIZED",
                message: "Invalid session",
            });
        }
    
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, type: "access" },
            env.JWT_ACCESS_SECRET,
            { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
        );
    
        return { accessToken };
    } catch (e) {
        if (e instanceof AppError) throw e;
    
        throw new AppError({
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
        });
    }
};

export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError({
            status: 404,
            code: "NOT_FOUND",
            message: "User not found",
        });
    }

    return user;
};
