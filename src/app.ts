import { errorHandler } from "./middlewares/errorHandler.middleware";
import express from "express";
// Routes
import { index } from "./routes/index.route";
import morgan from "morgan";
import morganBody from "morgan-body";
import winston from "winston";

// Create Express server
export const app = express();

morganBody(app, {
    theme: "dimmed",
    skip: (req, res) => {
        switch (req.originalUrl) {
            case "/login":
                winston.info(req.originalUrl);
                return true;
            default:
                return false;
        }
    },
});

app.use(morgan("dev"));

// Express configuration
app.set("port", process.env.PORT || 3000);

app.use(express.json());

app.use("/", index);

app.use(errorHandler);
