import Logger from "./lib/logger";
import { app } from "./app";
import { connection } from "./config/database";

const port = app.get("port");
const logger = Logger("debug", __filename);

connection
    .then(() => {
        logger.info("DB connected!");

        const server = app.listen(port, onListening);
        server.on("error", onError);

        function onError(error: NodeJS.ErrnoException) {
            if (error.syscall !== "listen") {
                throw error;
            }

            const bind =
                typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case "EACCES":
                    logger.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case "EADDRINUSE":
                    logger.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        function onListening() {
            const addr = server.address();
            const bind =
                typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
            logger.info(`Listening on ${bind}`);
        }
    })
    .catch(error => {
        logger.error(
            "An error occurred while connecting to the database",
            error,
        );
    });
