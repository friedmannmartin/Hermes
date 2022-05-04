import crypto from "crypto";
import db from "../db.js";

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;
const YEARS = 365 * DAYS;

export const getUser = async (email, password) => {
    const user = await db("users").where({ email }).first();

    if (user == undefined) {
        return false;
    }

    const hash = crypto
        .pbkdf2Sync(password, user.salt, 100000, 64, "sha512")
        .toString("hex");

    if (user.hash === hash) {
        return user;
    } else {
        return false;
    }
};

export const getUserByToken = async (token) => {
    const user = await db("users").where({ token }).first();

    return user;
};

export const createUser = async (email, name, password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 100000, 64, "sha512")
        .toString("hex");
    const token = crypto.randomBytes(16).toString("hex");

    const ids = await db("users").insert({ email, name, salt, hash, token }).catch((err)=>{
        return false
    });

    if(ids) {
        const user = await db("users").where("id", ids[0]).first();
        return user;
    } else {
        return false
    }
};

export const getPasswordResetToken = async (email) => {
    const password_reset_token = crypto.randomBytes(16).toString("hex");
    const password_reset_token_expiration = Date.now() + 1 * DAYS;
    const id = await db("users").where({ email }).update({
        password_reset_token: password_reset_token,
        password_reset_token_expiration: password_reset_token_expiration,
    });

    const user = await db("users").where("id", id).first();

    return user;
};

export const resetUserPassword = async (password_reset_token, password) => {
    const user = await db("users").where({ password_reset_token: password_reset_token }).first();
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 100000, 64, "sha512")
        .toString("hex");

    if (typeof user !== "undefined" && user.password_reset_token_expiration >= Date.now()) {
        await db("users").where({ id: user.id }).update({ salt: salt, hash: hash, password_reset_token: null, password_reset_token_expiration: null });

        return true;
    } else {
        return false;
    }
};
