import ejs from "ejs";
import { WebSocketServer, WebSocket } from "ws";
import { getAllUsers, getMessages } from "./db/chats.js";

/** @type {Set<WebSocket>} */
const connections = new Set();

export const createWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        connections.add(ws);

        ws.on("message", (data) => {
            const user_id = data.id;
            ws.user_id = user_id;
        });

        ws.on("close", () => {
            connections.delete(ws);
        });
    });
};

export const sendUsersToAllConnections = async () => {
    const friends = await getAllUsers();

    for (const connection of connections) {

        const html = await ejs.renderFile("./views/_friends.ejs", {
            friends: friends,
            user: {id: connection.user_id}
        });

        const message = {
            type: "friends",
            html,
        };
        const json = JSON.stringify(message);
        connection.send(json);
    }
};

export const sendMessagesToAddresseeConnections = async (user, friend) => {
    const messages = await getMessages(user, friend);

    const html = await ejs.renderFile("./views/_messages.ejs", {
        user: { id: friend },
        messages: messages,
    });

    for (const connection of connections) {
        const message = {
            type: "messages",
            addressee: friend,
            html,
        };
        const json = JSON.stringify(message);
        connection.send(json);
    }
};
