import express from "express";
import { sendMessagesToAddresseeConnections } from "../websockets.js";
import {
    getUserByName,
    getAllUsers,
    getMessages,
    sendMessage,
} from "../db/chats.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/chats", auth, async (req, res) => {
    const user = res.locals.user;
    const friends = await getAllUsers(user.id);
    res.render("chats", { title: "Chats", friends: friends, user: user });
});

router.get("/chat/:name", auth, async (req, res) => {
    const user = res.locals.user;
    const friend_name = req.params.name || null;

    if (friend_name === null) {
        res.redirect("/chats");
    }

    const friends = await getAllUsers(user.id);
    const friend = await getUserByName(friend_name);
    const messages = await getMessages(user.id, friend.id);

    res.render("chats", { friends: friends, friend: friend, messages: messages });
});

router.post("/send-message", auth, async (req, res) => {
    const sender = res.locals.user.id;
    const addressee = req.body.addressee;
    const text = req.body.text;

    await sendMessage(sender, addressee, text);

    sendMessagesToAddresseeConnections(sender,addressee);

    res.redirect("back");
});

export default router;
