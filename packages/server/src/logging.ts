import * as emoji from "node-emoji";
import winston, { format, transports, type LoggerOptions } from "winston";
import { IS_CLOUD } from "./config.js";

const localLoggerConfig: LoggerOptions = {
    level: "info",
    transports: [new transports.Console()],
    format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => {
            return emoji.emojify(`${level}: ${message}`);
        })
    ),
};

const cloudLoggerConfig: LoggerOptions = {
    level: "warn",
    transports: [new transports.Console()],
    format: format.combine(format.json()),
};

export const logger = winston.createLogger(
    IS_CLOUD ? cloudLoggerConfig : localLoggerConfig
);
