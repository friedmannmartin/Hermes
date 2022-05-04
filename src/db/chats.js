import db from "../db.js";

export const getUserByName = async (name) => {
    const user = await db("users").where({ name }).first();

    return user;
};

export const getAllUsers = async () => {
    const users = await db("users");

    return users;
};

export const getMessages = async (user, friend) => {
    const messages = await db("messages").where({sender: user, addressee: friend}).orWhere({sender:friend, addressee: user}).orderBy("created_at")

    return messages;
};

export const sendMessage = async (sender, addressee, text) => {
    const message = await db("messages").insert({sender: sender, addressee: addressee, text: text})

    return message
}
