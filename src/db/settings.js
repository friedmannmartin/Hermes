import crypto from "crypto";
import db from "../db.js";

export const changeUserPassword = async (user_id, password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    await db("users").where({ id: user_id }).update({ hash: hash });
};

export const enableTwoFactorAuthentication = async (id, totp_secret, totp_qr, totp_uri) => {
    await db("users")
        .where({ id })
        .update({ totp_secret, totp_qr, totp_uri });
};

export const disableTwoFactorAuthentication = async (id) => {
    await db("users")
        .where({ id })
        .update({ totp_secret: null, totp_qr: null, totp_uri: null });
};

export const deleteUser = async (id) => {
    await db("users").where({ id: id }).del();
};
