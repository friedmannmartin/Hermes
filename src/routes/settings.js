import express from "express";
import twofactor from "node-2fa";
import { sendUsersToAllConnections } from "../websockets.js";
import {
    changeUserPassword,
    enableTwoFactorAuthentication,
    disableTwoFactorAuthentication,
    deleteUser,
} from "../db/settings.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/settings", auth, async (req, res) => {
    res.render("settings", {title: "Settings"});
});

router.post("/change-password", auth, async (req, res) => {
    const user_id = res.locals.user.id;
    const password = req.body.password;
    await changeUserPassword(user_id, password);
    res.redirect("/settings");
});

router.get("/enable-two-factor-authentication", auth, async (req, res) => {
    const user_id = res.locals.user.id;
    const email = res.locals.user.email
    const secret = twofactor.generateSecret({name: "Nodest", account: email})
    await enableTwoFactorAuthentication(user_id, secret.secret, secret.qr, secret.uri);
    res.redirect("/settings");
});

router.get("/disable-two-factor-authentication", auth, async (req, res) => {
    const user_id = res.locals.user.id;
    await disableTwoFactorAuthentication(user_id);
    res.redirect("/settings");
});

router.get("/delete-account", auth, async (req, res) => {
    const user_id = res.locals.user.id;
    await deleteUser(user_id);
    sendUsersToAllConnections()
    res.clearCookie("token");
    res.redirect("/");
});

export default router;
