import chalk from 'chalk';
import path from 'path';
import stringify from 'fast-safe-stringify';
import winston from "winston";

type logObject = string | Record<string, unknown> | Record<string, unknown>[] | undefined;

const Logger = (level = 'debug', fileName: string, ...additionalParams: logObject[]): winston.Logger => {
    const initialLogs: logObject[] = [];
    if (path.parse(fileName)) {
        const projPath = fileName.split('/').slice(-2).join('/');
        initialLogs.push(projPath);
    }
    initialLogs.push(...additionalParams);

    const winstonLogger = winston.createLogger({
        level,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.errors(),
            winston.format.simple(),
        ),
        transports: [new winston.transports.Console()],
    });

    const colorize = (str: string) => {
        const rdClr = () => Math.floor(Math.random() * 255);
        const randomClor = (str: string) => chalk.rgb(rdClr(), rdClr(), rdClr())(str);
        return randomClor(str);
    };

    const wrapper = (original: winston.LeveledLogMethod) => (...args: unknown[]) => {
        if (args.length === 0) original('');
        let logs = [...initialLogs.map((iarg) => typeof iarg === 'object' ? stringify(iarg) : `${iarg}`),
        ...args.map((arg) => typeof arg === 'object' ? stringify(arg) : `${arg}`)];

        logs = logs.map((log) => colorize(log));
        return original(logs.join(' | '));
    };

    winstonLogger.error = wrapper(winstonLogger.error);
    winstonLogger.warn = wrapper(winstonLogger.warn);
    winstonLogger.info = wrapper(winstonLogger.info);
    winstonLogger.verbose = wrapper(winstonLogger.verbose);
    winstonLogger.debug = wrapper(winstonLogger.debug);
    winstonLogger.silly = wrapper(winstonLogger.silly);

    return winstonLogger;
};

export default Logger;
