import express from "express";
import cookieParser from "cookie-parser";
import loadUser from "./middleware/loadUser.js";
import usersRouter from "./routes/users.js";
import settingsRouter from "./routes/settings.js";
import chatsRouter from "./routes/chats.js";

export const app = express();

app.set("view engine", "ejs");

app.locals.appUrl = process.env.APP_URL + ":3000"

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(loadUser);

app.use(usersRouter);
app.use(settingsRouter);
app.use(chatsRouter);

app.use((req, res) => {
    console.log("404", req.method, req.url);
    res.status(404).render("404");
});
