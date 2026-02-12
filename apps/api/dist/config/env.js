"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
if (Number.isNaN(PORT))
    throw new Error("PORT must be a number");
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL)
    throw new Error("DATABASE_URL is required");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!JWT_ACCESS_SECRET)
    throw new Error("JWT_ACCESS_SECRET is required");
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_SECRET)
    throw new Error("JWT_REFRESH_SECRET is required");
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);
if (!BCRYPT_SALT_ROUNDS || Number.isNaN(BCRYPT_SALT_ROUNDS)) {
    throw new Error("BCRYPT_SALT_ROUNDS must be a number");
}
exports.env = {
    PORT,
    DATABASE_URL,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS,
};
