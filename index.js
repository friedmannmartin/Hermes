import dotenv from "dotenv";

dotenv.config();

const main = async () => {
    const { app } = await import("./src/app.js");
    const { createWebSocketServer } = await import("./src/websockets.js");

    const port = process.env.APP_PORT || 3000;

    const server = app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });

    createWebSocketServer(server);
};

main();
