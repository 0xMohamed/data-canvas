import crypto from "crypto";

export const generatePublicToken = () => crypto.randomBytes(24).toString("hex");
