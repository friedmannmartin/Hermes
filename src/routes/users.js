import express from "express";
import nodemailer from "nodemailer";
import twofactor from "node-2fa";
import clipboard from "clipboardy";
import { sendUsersToAllConnections } from "../websockets.js";
import {
    getUser,
    createUser,
    getPasswordResetToken,
    resetUserPassword,
} from "../db/users.js";


const router = express.Router();

const SECONDS = 1000
const MINUTES = 60 * SECONDS
const HOURS = 60 * MINUTES
const DAYS = 24 * HOURS
const YEARS = 365 * DAYS

router.get("/", async (req, res) => {
    res.render("sign-in", {title: "Sign in"});
});

router.post("/", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe || false;
    const user = await getUser(email, password);

    if (user.totp_secret) {
        const totp_code = twofactor.generateToken(user.totp_secret).token
        clipboard.write(totp_code)
        console.log(totp_code);
        const credentials = {
            email: email,
            password: password,
            rememberMe: rememberMe,
        };
        res.cookie("credentials", credentials);
        res.redirect("/two-factor-authentication");
    } else if (user && user.totp_secret == null) {
        res.cookie("token", user.token, {
            maxAge: rememberMe ? 1 * YEARS : 1 * DAYS
        });
        res.redirect("/chats");
    } else {
        res.render("sign-in",{title: "Sign in", err: "Bad credentials. Please login again."});
    }
});

router.get("/two-factor-authentication", async (req, res) => {
    const credentials = req.cookies.credentials;
    res.clearCookie("credentials");
    res.render("two-factor-authentication", {title: "Two-factor authentication", credentials: credentials});
});

router.post("/two-factor-authentication", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const rememberMe = req.body.rememberMe;
    const totp_code = req.body.totp;
    const user = await getUser(email, password);
    const result = twofactor.verifyToken(user.totp_secret, totp_code);

    if (result == null) {
        const credentials = {
            email: email,
            password: password,
            rememberMe: rememberMe,
        };
        res.render("two-factor-authentication", {title: "Two-factor authentication", err: "Wrong code.", credentials: credentials});
    } else if (result.delta === 0) {
        res.cookie("token", user.token, {
            maxAge: rememberMe ? 1 * YEARS : 1 * DAYS,
        });
        res.redirect("/chats");
    }
});

router.get("/sign-up", async (req, res) => {
    res.render("sign-up", {title: "Sign up"});
});

router.post("/sign-up", async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const user = await createUser(email, name, password);

    if (user) {
        sendUsersToAllConnections()
        res.cookie("token", user.token, { maxAge: 1 * DAYS });
        res.redirect("/chats");
    } else {
        res.render("sign-up", {title: "Sign up", err: "User already exists."});
    }
});

router.get("/sign-out", async (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

router.get("/forgotten-password", async (req, res) => {
    res.render("forgotten-password", {title: "Forgotten password"});
});

router.post("/forgotten-password", async (req, res) => {
    const email = req.body.email;
    const user = await getPasswordResetToken(email);

    if (typeof user === "undefined") {
        res.redirect("/");
    } else {
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "b1a88cf21df073",
                pass: "db52217975a18e",
            },
        });

        transport.sendMail({
            from: "noreply@nodest.io",
            to: user.email,
            subject: "Password reset",
            html: `Hello ${user.name}, <br>
                   We received a request to reset the password for your account. <br>
                   To reset your password, click on the link below: <br>
                   <a href="https://nodest.io/password-reset?token=${user.password_reset_token}">https://nodest.io/password-reset?token=${user.password_reset_token}</a> <br>
                   If you dod not forgot your password you can safely ignore this email.`,
        });

        res.redirect("/");
    }
});

router.get("/password-reset", async (req, res) => {
    const password_reset_token = req.query.token.toString() || null;

    if (password_reset_token) {
        res.render("password-reset", {title: "Password reset", password_reset_token: password_reset_token});
    } else {
        res.redirect("/");
    }
});

router.post("/password-reset", async (req, res) => {
    const password_reset_token = req.body.password_reset_token;
    const password = req.body.password;
    const passwordChanged = await resetUserPassword(password_reset_token, password);

    if (passwordChanged) {
        res.redirect("/");
    } else {
        res.render("password-reset", {title: "Password reset", err: "Password reset token expired. Please repeate the process."});
    }
});

export default router;
